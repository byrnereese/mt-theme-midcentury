(function($){
    $.fn.greet = function(options) {
	var defaults = {
	    /* Messages */
	    loggedInMessage:     'Welcome, %p! %o',
	    loggedOutMessage:    '%i or %r',
	    noPermissionMessage: 'Welcome, %p! %o',
	    loginText:           'Sign In',
	    logoutText:          'Sign Out',
	    registerText:        'Sign Up',
	    editProfileText:     '%u',
            linkClass: 'button',
            mode: 'mtos',
            indicator:           mt.blog.staticWebPath+'images/indicator.white.gif',
            isPreview: false,
	    returnToURL: null, 
	    /* Events and Callbacks */
	    onSignInClick:  function(e){ return _onSignInClick( $(e) ); },
	    onSignOutClick: function(e){ return _onSignOutClick( $(e) ); },
	    onSignUpClick:  function(e){ return _onSignUpClick( $(e) ); }
	};
	var self;
        var settings = $.extend( {}, defaults, options);
	return this.each(function() {
	    obj = $(this);
	    self = obj;
	    if (jQuery.needsAuth) {
	      $(this).onauthchange( function(e, u) { 
		  _insertText( $(this) ); 
              });
	    } else {
	      _insertText( $(this) );
	      $(this).onauthchange( function() { _insertText( obj ); return false; });
	    }
	});	

	function _insertText(obj) {
	  var phrase = compileGreetingText();
	  obj.empty().append( jQuery("<div>" + phrase + "</div>") );
	  obj.children().children('a.login').click(    function() { return settings.onSignInClick($(this)); });
	  obj.children().children('a.logout').click(   function() { return settings.onSignOutClick.call($(this)); });
	  obj.children().children('a.register').click( function() { return settings.onSignUpClick.call($(this)); });
	};
	function _signIn() {
	    var url = mt.links.signIn;
            if (url.match(/\?/)) { url += '&'; } else { url += '?'; }
	    if (settings.isPreview) {
		if ( mt.entry && mt.entry.id ) {
		    url += 'entry_id=' + mt.entry.id;
		} else {
		    url += 'return_url=' + settings.returnToURL;
		}
	    } else {
	      var doc_url = document.URL;
	      doc_url = doc_url.replace(/#.+/, '');
		if ( mt.entry && mt.entry.id ) {
		    url += 'entry_id=' + mt.entry.id;
		} else {
                    url += 'return_url=' + encodeURIComponent(doc_url);
                }
	    }
	    $.fn.movabletype.clearUser();
	    location.href = url;
	};
	function _onSignOutClick(e) {
	    $.fn.movabletype.clearUser();
	    var doc_url = document.URL;
	    doc_url = doc_url.replace(/#.+/, '');
	    // TODO - error check: signouturl not set?
	    var url = mt.links.signOut;
            if (url.match(/\?/)) { url += '&'; } else { url += '?'; }
	    if (settings.isPreview) {
	      if ( mt.entry && mt.entry.id ) {
		url += 'entry_id=' + mt.entry.id;
	      } else {
		url += 'return_url=' + settings.returnToURL;
	      }
	    } else {
	      if (settings.returnToURL) { 
		url += 'return_url=' + settings.returnToURL;
	      } else {
		url += 'return_url=' + encodeURIComponent(doc_url);
	      }
	    }
	    location.href = url;
	    return false;
	};
	function _onSignUpClick(e) {
	    try {
		$.fn.movabletype.clearUser();
		var doc_url = document.URL;
		doc_url = doc_url.replace(/#.+/, '');
		// TODO - error check: signupurl not set?
		var url = mt.links.signUp;
                if (url.match(/\?/)) { url += '&'; } else { url += '?'; }
		if (settings.isPreview) {
		    if ( mt.entry && mt.entry.id ) {
			url += 'entry_id=' + mt.entry.id;
		    } else {
			url += 'return_url=' + settings.returnToURL;
		    }
		} else {
		    url += 'return_url=' + encodeURIComponent(doc_url);
		}
		location.href = url;
	    } catch(x) { alert(x.message); };
	    return false;
	};
	function _onSignInClick(e) {
	  var phrase = 'Signing in... <img src="'+settings.indicator+'" height="16" width="16" alt="" />';
	  var target = e.parent().parent();
	  target.html(phrase);
	  $.fn.movabletype.clearUser(); // clear any 'anonymous' user cookie to allow sign in
	  $.fn.movabletype.fetchUser(function(u) {
	      if (u && u.is_authenticated) {
		$.fn.movabletype.setUser(u);
		_insertText( $(target) );
	      } else {
		// user really isn't logged in; so let's do this!
		_signIn();
	      }
	  });
	  return false;
        };
	function compileGreetingText() {
	    var phrase;
	    var u = $.fn.movabletype.getUser();
	    var profile_link;
	    if ( u && u.is_authenticated ) {
		if ( u.is_banned ) {
		    phrase = settings.noPermissionText;
		    //'You do not have permission to comment on this blog. (<a href="javascript:void(0);" onclick="return mtSignOutOnClick();">sign out</a>)';
		} else {
		  if ( u.is_author ) {
		    if (mt.links.editProfile) {
		      profile_link = '<a href="'+mt.links.editProfile;
		    } else if (settings.mode == "mtpro") {
		      profile_link = '<a href="'+mt.blog.community.script+'?__mode=edit&blog_id=' + mt.blog.id;
		    } else {
		      profile_link = '<a href="'+mt.blog.comments.script+'?__mode=edit_profile&blog_id=' + mt.blog.id;
		    }
		    if (mt.entry && mt.entry.id)
		      profile_link += '&entry_id=' + mt.entry.id;
		    if (settings.returnToURL)
		      profile_link += '&return_to=' + encodeURI(settings.returnToURL);
		    profile_link += '">' + settings.editProfileText + '</a>';
		  } else {
		    // registered user, but not a user with posting rights
		    if (u.url)
		      profile_link = '<a href="' + u.url + '">' + u.name + '</a>';
		    else
		      profile_link = u.name;
		  }
		  phrase = settings.loggedInMessage;
		}
	    } else {
		// TODO - this obviously does that same thing. 
		if (mt.blog.registration.required) {
		    phrase = settings.loggedOutMessage;
		} else {
		    phrase = settings.loggedOutMessage;
		}
	    }
	    var login_link    = '<a class="login '+settings.linkClass+'" href="javascript:void(0)">' + settings.loginText + '</a>';
	    var logout_link   = '<a class="logout '+settings.linkClass+'" href="javascript:void(0)">' + settings.logoutText + '</a>';
	    var register_link = '<a class="register '+settings.linkClass+'" href="javascript:void(0)">' + settings.registerText + '</a>';

	    phrase = phrase.replace(/\%p/,profile_link);
	    phrase = phrase.replace(/\%i/,login_link);
	    phrase = phrase.replace(/\%o/,logout_link);
	    phrase = phrase.replace(/\%r/,register_link);
	    if ( u && u.is_authenticated ) {
		phrase = phrase.replace(/\%u/,u.name);
	    }
	    return phrase;
	};
    };
})(jQuery);
