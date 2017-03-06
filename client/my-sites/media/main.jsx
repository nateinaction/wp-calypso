/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import MediaLibrary from 'my-sites/media-library';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import observe from 'lib/mixins/data-observe';
import Dialog from 'components/dialog';
import { EditorMediaModalDetail } from 'post-editor/media-modal/detail';
import ImageEditor from 'blocks/image-editor';
import VideoEditor from 'blocks/video-editor';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import accept from 'lib/accept';

export default React.createClass( {
	displayName: 'Media',

	mixins: [ observe( 'sites' ) ],

	propTypes: {
		sites: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			currentDetail: null,
			editedImageItem: null,
			editedVideoItem: null,
			selectedItems: [],
		};
	},

	componentDidMount: function() {
		this.setState( {
			containerWidth: this.refs.container.clientWidth
		} );
	},

	onFilterChange: function( filter ) {
		let redirect = '/media';

		if ( filter ) {
			redirect += '/' + filter;
		}

		if ( this.props.sites.selected ) {
			redirect += '/' + this.props.sites.selected;
		}

		page( redirect );
	},

	openDetailsModalForASingleImage( image ) {
		this.setState( {
			currentDetail: 0,
			selectedItems: [ image ],
		} );
	},

	openDetailsModalForAllSelected() {
		const site = this.props.sites.getSelectedSite();
		const selected = MediaLibrarySelectedStore.getAll( site.ID );

		this.setState( {
			currentDetail: 0,
			selectedItems: selected
		} );
	},

	closeDetailsModal() {
		this.setState( { editedImageItem: null, editedVideoItem: null, currentDetail: null, selectedItems: [] } );
	},

	editImage() {
		this.setState( { currentDetail: null, editedImageItem: this.state.currentDetail } );
	},

	editVideo() {
		this.setState( { currentDetail: null, editedVideoItem: this.state.currentDetail } );
	},

	onImageEditorCancel: function( imageEditorProps ) {
		const {	resetAllImageEditorState } = imageEditorProps;
		this.setState( { currentDetail: this.state.editedImageItem, editedImageItem: null } );

		resetAllImageEditorState();
	},

	onImageEditorDone( error, blob, imageEditorProps ) {
		if ( error ) {
			this.onEditImageCancel( imageEditorProps );

			return;
		}

		const {
			fileName,
			site,
			ID,
			resetAllImageEditorState
		} = imageEditorProps;

		const mimeType = MediaUtils.getMimeType( fileName );

		const item = {
			ID: ID,
			media: {
				fileName: fileName,
				fileContents: blob,
				mimeType: mimeType
			}
		};

		MediaActions.update( site.ID, item, true );
		resetAllImageEditorState();
		this.setState( { currentDetail: null, editedImageItem: null, selectedItems: [] } );
	},

	getModalButtons() {
		// do not render buttons if the media image or video editor is opened
		if ( ( this.state.editedImageItem !== null ) || ( this.state.editedVideoItem !== null ) ) {
			return null;
		}

		return [
			{
				action: 'delete',
				additionalClassNames: 'media__modal-delete-item-button is-link',
				label: this.translate( 'Delete' ),
				isPrimary: false,
				disabled: false,
				onClick: this.deleteMediaByItemDetail,
			},
			{
				action: 'confirm',
				label: this.translate( 'Done' ),
				isPrimary: true,
				disabled: false,
				onClose: this.closeDetailsModal,
			}
		];
	},

	onVideoEditorCancel: function() {
		this.setState( { currentDetail: this.state.editedVideoItem, editedVideoItem: null } );
	},

	onVideoEditorUpdatePoster( { ID, poster } ) {
		const site = this.props.sites.getSelectedSite();

		// Photon does not support URLs with a querystring component.
		poster = poster.split( '?' )[ 0 ];

		if ( site ) {
			MediaActions.edit( site.ID, {
				ID,
				thumbnails: {
					fmt_hd: poster,
					fmt_dvd: poster,
					fmt_std: poster,
				}
			} );
		}

		this.setState( { currentDetail: null, editedVideoItem: null, selectedItems: [] } );
	},

	restoreOriginalMedia: function( siteId, item ) {
		if ( ! siteId || ! item ) {
			return;
		}
		MediaActions.update( siteId, { ID: item.ID, media_url: item.guid }, true );
		this.setState( { currentDetail: null, editedImageItem: null, selectedItems: [] } );
	},

	setDetailSelectedIndex: function( index ) {
		this.setState( { currentDetail: index } );
	},

	/**
	 * Start the process to delete media items.
	 * `callback` is an optional parameter which will execute once the confirm dialog is accepted.
	 * It's used especially when the item is attempting to be removed using the item detail dialog.
	 *
	 * @param  {Function} [callback] - callback function
	 */
	deleteMedia: function( callback ) {
		const site = this.props.sites.getSelectedSite();
		const selected = MediaLibrarySelectedStore.getAll( site.ID );
		const selectedCount = selected.length;
		const confirmMessage = this.translate(
			'Are you sure you want to permanently delete this item?',
			'Are you sure you want to permanently delete these items?',
			{ count: selectedCount }
		);

		accept( confirmMessage, accepted => {
			if ( ! accepted ) {
				return;
			}

			this.confirmDeleteMedia();
			if ( callback ) {
				callback();
			}
		} );
	},

	handleDeleteMediaEvent() {
		this.deleteMedia();
	},

	deleteMediaByItemDetail() {
		this.deleteMedia( () => this.closeDetailsModal() );
	},

	confirmDeleteMedia: function() {
		const site = this.props.sites.getSelectedSite();

		if ( ! site ) {
			return;
		}

		const selected = this.state.selectedItems && this.state.selectedItems.length
			? this.state.selectedItems
			: MediaLibrarySelectedStore.getAll( site.ID );

		MediaActions.delete( site.ID, selected );
	},

	render: function() {
		const site = this.props.sites.getSelectedSite();
		return (
			<div ref="container" className="main main-column media" role="main">
				<SidebarNavigation />
				{ ( this.state.editedImageItem !== null || this.state.editedVideoItem !== null || this.state.currentDetail !== null ) &&
					<Dialog
						isVisible={ true }
						additionalClassNames="editor-media-modal media__item-dialog"
						buttons={ this.getModalButtons() }
						onClose={ this.closeDetailsModal }
					>
					{ this.state.currentDetail !== null &&
						<EditorMediaModalDetail
							site={ site }
							items={ this.state.selectedItems }
							selectedIndex={ this.state.currentDetail }
							onReturnToList={ this.closeDetailsModal }
							onEditImageItem={ this.editImage }
							onEditVideoItem={ this.editVideo }
							onRestoreItem={ this.restoreOriginalMedia }
							onSelectedIndexChange={ this.setDetailSelectedIndex }
						/>
					}
					{ this.state.editedImageItem !== null &&
						<ImageEditor
							siteId={ site && site.ID }
							media={ this.state.selectedItems[ this.state.editedImageItem ] }
							onDone={ this.onImageEditorDone }
							onCancel={ this.onImageEditorCancel }
						/>
					}
					{ this.state.editedVideoItem !== null &&
						<VideoEditor
							media={ this.state.selectedItems[ this.state.editedVideoItem ] }
							onCancel={ this.onVideoEditorCancel }
							onUpdatePoster={ this.onVideoEditorUpdatePoster }
						/>
					}
					</Dialog>
				}
				{ site && site.ID && (
					<MediaLibrarySelectedData siteId={ site.ID }>
						<MediaLibrary
							{ ...this.props }
							className="media__main-section"
							onFilterChange={ this.onFilterChange }
							site={ site }
							single={ false }
							filter={ this.props.filter }
							onEditItem={ this.openDetailsModalForASingleImage }
							onViewDetails={ this.openDetailsModalForAllSelected }
							onDeleteItem={ this.handleDeleteMediaEvent }
							modal={ false }
							containerWidth={ this.state.containerWidth } />
					</MediaLibrarySelectedData>
				) }
			</div>
		);
	}
} );
