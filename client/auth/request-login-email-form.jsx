/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import LoggedOutForm from 'components/logged-out-form';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';

import config from 'config';
import debugFactory from 'debug';
import formState from 'lib/form-state';
import { getCurrentUser } from 'state/current-user/selectors';
import wpcom from 'lib/wp';

const debug = debugFactory( 'calypso:magic-login' );

class RequestLoginEmailForm extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			hasSubmitted: false,
			isEmailValid: false,
		};
	}
	componentWillMount() {
		const stateSetter = this.setFormState.bind( this );

		this.formStateController = new formState.Controller( {
			fieldNames: [ 'emailAddress' ],
			debounceWait: 100,
			validatorFunction: this.validate.bind( this ),
			onNewState: stateSetter,
			hideFieldErrorsOnChange: false,
			initialState: {
				emailAddress: {
					value: '',
				}
			}
		} );

		stateSetter( this.formStateController.getInitialState() );
	}

	setFormState( state ) {
		debug( 'setFormState', state );
		this.setState( { form: state } );
	}

	handleChangeEvent( event ) {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value
		} );
	}

	handleSubmit( event ) {
		event.preventDefault();

		const emailAddress = formState.getFieldValue( this.state.form, 'emailAddress' );
		debug( 'form submitted!', emailAddress );

		if ( ! emailAddress ) {
			return;
		}

		this.setState( {
			hasSubmitted: true,
		} );

		wpcom.undocumented().requestMagicLoginEmail( {
			email: emailAddress
		}, ( resp ) => {
			debug( resp );
		} );
	}

	validate( formValues ) {
		const emailAddress = formValues.emailAddress;
		const isEmailValid = emailValidator.validate( emailAddress );
		debug( 'validate', emailAddress, isEmailValid );
		this.setState( {
			isEmailValid
		} );
	}

	render() {
		return (
			<div>
				<LoggedOutForm onSubmit={ ( e ) => this.handleSubmit( e ) }>
					<p>Get a link sent to the email address associated with your account and log in instantly without your password.</p>
					{ this.props.currentUser
						? <p>{ 'NOTE: You are already logged in as user: ' + this.props.currentUser.username }</p>
						: null }
					<FormFieldset>
						<FormTextInput
							autoCapitalize="off"
							autoFocus="true"
							name="emailAddress"
							placeholder="Email address"
							value={ this.state.form.emailAddress.value }
							onChange={ ( e ) => this.handleChangeEvent( e ) }
						/>

						<LoggedOutFormFooter>
							<FormButton primary disabled={ this.state.hasSubmitted || ! this.state.isEmailValid }>
								Request Email
							</FormButton>
						</LoggedOutFormFooter>
					</FormFieldset>
				</LoggedOutForm>
				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem href={ config( 'login_url' ) }>
						Enter a password instead
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>
			</div>
		);
	}
}

const mapState = state => {
	return {
		currentUser: getCurrentUser( state ),
	};
};

const mapDispatch = null; /*dispatch => {
	return {
		// Action dispatchers go here
	};
}; */
export default connect( mapState, mapDispatch )( RequestLoginEmailForm );
