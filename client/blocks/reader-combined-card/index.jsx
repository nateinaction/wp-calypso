/**
 * External Dependencies
 */
import React from 'react';
import { get, size } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import { getStreamUrl } from 'reader/route';
import ReaderAvatar from 'blocks/reader-avatar';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link';
import { siteNameFromSiteAndPost } from 'reader/utils';
import ReaderCombinedCardPost from './post';
import { keysAreEqual, keyForPost } from 'lib/feed-stream-store/post-key';
import { recordTrack } from 'reader/stats';

class ReaderCombinedCard extends React.Component {

	static propTypes = {
		posts: React.PropTypes.array.isRequired,
		site: React.PropTypes.object,
		feed: React.PropTypes.object,
		onClick: React.PropTypes.func,
		isDiscover: React.PropTypes.bool,
		selectedPostKey: React.PropTypes.object
	}

	static defaultProps = {
		isDiscover: false,
	}

	componentDidMount() {
		const { posts, site, feed } = this.props;
		const feedId = get( feed, 'feed_ID' );
		const siteId = get( site, 'ID' );
		recordTrack( 'calypso_reader_combined_card_render', {
			blog_id: siteId,
			feed_id: feedId,
			post_count: size( posts ),
		} );
	}

	render() {
		const { posts, site, feed, selectedPostKey, onClick, isDiscover, translate } = this.props;
		const feedId = get( feed, 'feed_ID' );
		const siteId = get( site, 'ID' );
		const siteIcon = get( site, 'icon.img' );
		const feedIcon = get( feed, 'image' );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteName = siteNameFromSiteAndPost( site, posts[ 0 ] );
		const isSelectedPost = post => keysAreEqual( keyForPost( post ), selectedPostKey );

		return (
			<Card className="reader-combined-card">
				<header className="reader-combined-card__header">
					<ReaderAvatar
						siteIcon={ siteIcon }
						feedIcon={ feedIcon }
						author={ null }
						preferGravatar={ true }
						siteUrl={ streamUrl }
						siteIconSize={ 32 } />
					<div className="reader-combined-card__header-details">
						<ReaderSiteStreamLink
							className="reader-combined-card__site-link"
							feedId={ feedId }
							siteId={ siteId }>
							{ siteName }
						</ReaderSiteStreamLink>
						<p className="reader-combined-card__header-post-count">
							{ translate( '%(count)d posts', {
								args: {
									count: posts.length
								}
							} ) }
						</p>
					</div>
				</header>
				<ul className="reader-combined-card__post-list">
					{ posts.map( post => (
						<ReaderCombinedCardPost
							key={ `post-${ post.ID }` }
							post={ post }
							streamUrl={ streamUrl }
							onClick={ onClick }
							isDiscover={ isDiscover }
							isSelected={ isSelectedPost( post ) }
							/>
					) ) }
				</ul>
			</Card>
		);
	}
}

export default localize( ReaderCombinedCard );
