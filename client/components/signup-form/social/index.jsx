/**
 * External dependencies
 */
import React, { Component } from 'react';
import capitalize from 'lodash/capitalize';
import SocialLogo from 'social-logos';
import { GoogleLogin } from 'react-google-login-component';
import { FacebookLogin } from 'react-facebook-login-component';
import { get } from 'lodash';

/**
 * External dependencies
 */
import config from 'config';

const accessTokenPaths = {
	google: 'Zi.access_token',
	facebook: 'Zi.access_token',
};

class SocialSignupForm extends Component {
	static propTypes = {
	};

	constructor() {
		super();
		this.onGoogleResponse = this.onResponse.bind( this, 'google' );
		this.onFacebookResponse = this.onResponse.bind( this, 'facebook' );
	}

	onResponse( service, response ) {
		if ( response.error ) { // pop up blocked by the browser
			console.error( response.error );
		}
		console.log( 'AT = ', get( response, accessTokenPaths[ service ] ) );

	}

	getButtonContent( service ) {
		return (
			<span>
				<SocialLogo className="signup-form__social__logo" icon={ service } size={ 24 } />
				<span className="signup-form__social__service-name">{ capitalize( service ) }</span>
			</span>
		);
	}

	render() {
		return (
			<div className="signup-form__social">
				<GoogleLogin
					socialId={ config( 'google_oauth_client_id' ) }
					class="button signup-form__social__button"
					scope="profile"
					responseHandler={ this.onGoogleResponse }
					buttonText={ this.getButtonContent( 'google' ) } />
				<FacebookLogin
					socialId={ config( 'google_oauth_client_id' ) }
					language="en_US"
					scope="public_profile,email"
					responseHandler={ this.onFacebookResponse }
					xfbml={ true }
					fields="id,email,name"
					version="v2.5"
					class="button signup-form__social__button"
					buttonText={ this.getButtonContent( 'facebook' ) } />
			</div>
		);
	}
}

export default SocialSignupForm;
