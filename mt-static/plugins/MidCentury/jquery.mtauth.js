jQuery.extend({ authchangeList: [], authHappened: false, needsAuth: false });
(function($){
    $.fn.onauthchange = function( fn ) {
      return this.each(function() {
	  jQuery.authchangeList.push( this );
	  $(this).bind('onauthchange', fn);
          if (jQuery.authHappened) {
            $(this).trigger('onauthchange',$.fn.movabletype.user);
	  }
      });
    };
    $.fn.onauthchange.fire = function() {
      jQuery.authHappened = true;
      jQuery.needsAuth = false;
      jQuery.each( jQuery.authchangeList, function() { 
	  $(this).trigger('onauthchange',$.fn.movabletype.user); 
      });
    };
    $.fn.movabletype = function() {
      var calledOnUserSignIn = false;
      var _escapeJS   = function(s) { return s.replace(/\'/g, "&apos;"); }
      var _unescapeJS = function(s) { return s.replace(/&apos;/g, "'"); }
      var _getCookie  = function() {
	var prefix = mt.cookie.name + '=';
	var c = document.cookie;
	var cookieStartIndex = c.indexOf(prefix);
	if (cookieStartIndex == -1)
	  return '';
	var cookieEndIndex = c.indexOf(";", cookieStartIndex + prefix.length);
	if (cookieEndIndex == -1)
	  cookieEndIndex = c.length;
	var cookiestr = unescape(c.substring(cookieStartIndex + prefix.length, cookieEndIndex));
	return cookiestr;
      };
      var _unbakeCookie = function(s) {
	if (!s) return;
	var u = {};
	var m;
	while (m = s.match(/^((name|url|email|is_authenticated|profile|userpic|sid|is_trusted|is_author|is_banned|can_post|can_comment):'([^\']+?)';?)/)) {
                s = s.substring(m[1].length);
		if (m[2].match(/^(is|can)_/)) // boolean fields
		  u[m[2]] = m[3] == '1' ? true : false;
		else
		  u[m[2]] = _unescapeJS(m[3]);
	}
	if (u.is_authenticated) {
	  u.is_anonymous = false;
	} else {
	  u.is_anonymous = true;
          u.is_authenticated = false;
	  u.can_post = false;
	  u.is_author = false;
	  u.is_banned = false;
	  u.is_trusted = false;
	}
	return u;
      };
      $.fn.movabletype.getUser = function() {
	if (!$.fn.movabletype.user) {
	  var cookie = _getCookie();
	  if (cookie) {
            $.fn.movabletype.user = _unbakeCookie(cookie);
          }
	  if (!$.fn.movabletype.user) {
	    $.fn.movabletype.user = {};
	    $.fn.movabletype.user.is_anonymous = true;
	    $.fn.movabletype.user.is_authenticated = false;
	    $.fn.movabletype.user.can_post = false;
	    $.fn.movabletype.user.is_author = false;
	    $.fn.movabletype.user.is_banned = false;
	    $.fn.movabletype.user.is_trusted = false;
	  } else {
	  }
	}
	return $.fn.movabletype.user;
      };
      $.fn.movabletype.fetchUser = function(cb) {
	if (!cb) { 
          cb = function(u) { 
            return $.fn.movabletype.setUser(u); 
          } 
        }; 
	if ( $.fn.movabletype.getUser() && $.fn.movabletype.getUser().is_authenticated ) {
	  // user is logged into current domain...
	  var url = document.URL;
	  url = url.replace(/#.+$/, '');
	  url += '#comments-open';
	  location.href = url;
	  cb.call($.fn.movabletype.getUser());
	} else {
	  // we aren't using AJAX for this, since we may have to request
	  // from a different domain. JSONP to the rescue.
	  mtFetchedUser = true;
	  var url = mt.blog.comments.script + '?__mode=session_js&blog_id=' + mt.blog.id + '&jsonp=?';
	  // this is asynchronous, so it will return prior to the user being saved
	  $.getJSON(url,function(data) { 
	      cb(data) 
          });
	}
      };
      $.fn.movabletype.setUser = function(u) {
	if (u) {
	  // persist this
	  $.fn.movabletype.user = u;
	  $.fn.onauthchange.fire();
	  _saveUser();
	}
	return $.fn.movabletype.user;
      };
      var _saveUser = function(f) {
	// We can't reliably store the user cookie during a preview.
	// TODO - should isPreview be in the MT content of greeting context?
	//if (settings.isPreview) return;
	var u = $.fn.movabletype.getUser();
	if (f && (!u || u.is_anonymous)) {
	  if ( !u ) {
	    u = {};
	    u.is_authenticated = false;
	    u.can_comment = true;
	    u.is_author = false;
	    u.is_banned = false;
	    u.is_anonymous = true;
	    u.is_trusted = false;
	  }
	  if (f.author != undefined) u.name = f.author.value;
	  if (f.email != undefined) u.email = f.email.value;
	  if (f.url != undefined) u.url = f.url.value;
	}
	if (!u) return;
	
	var cache_period = mt.cookie.timeout * 1000;
	// cache anonymous user info for a long period if the
	// user has requested to be remembered
	if (u.is_anonymous && f && f.bakecookie && f.bakecookie.checked)
	  cache_period = 365 * 24 * 60 * 60 * 1000;
	
	var now = new Date();
	_fixDate(now);
	now.setTime(now.getTime() + cache_period);
	
	var cmtcookie = _bakeUserCookie(u);
	_setCookie(cmtcookie,now);
      };
      var _fixDate = function(date) {
	var skew = (new Date(0)).getTime();
	if (skew > 0) date.setTime(date.getTime() - skew);
      };
      var _bakeUserCookie = function(u) {
	var str = "";
	if (u.name) str += "name:'" + _escapeJS(u.name) + "';";
	if (u.url) str += "url:'" + _escapeJS(u.url) + "';";
	if (u.email) str += "email:'" + _escapeJS(u.email) + "';";
	if (u.is_authenticated) str += "is_authenticated:'1';";
	if (u.profile) str += "profile:'" + _escapeJS(u.profile) + "';";
	if (u.userpic) str += "userpic:'" + _escapeJS(u.userpic) + "';";
	if (u.sid) str += "sid:'" + _escapeJS(u.sid) + "';";
	str += "is_trusted:'" + (u.is_trusted ? "1" : "0") + "';";
	str += "is_author:'" + (u.is_author ? "1" : "0") + "';";
	str += "is_banned:'" + (u.is_banned ? "1" : "0") + "';";
	str += "can_post:'" + (u.can_post ? "1" : "0") + "';";
	str += "can_comment:'" + (u.can_comment ? "1" : "0") + "';";
	str = str.replace(/;$/, '');
	return str;
      };
      var _setCookie = function(value,expires) {
	var secure = location.protocol == 'https:';
	if (mt.cookie.domain && mt.cookie.domain.match(/^\.?localhost$/))
	  mt.cookie.domain = null;
	var curCookie = mt.cookie.name + "=" + escape(value) +
	  (expires ? "; expires=" + expires.toGMTString() : "") +
	  (mt.cookie.path ? "; path=" + mt.cookie.path : "") +
	  (mt.cookie.domain ? "; domain=" + mt.cookie.domain : "") +
	  (secure ? "; secure" : "");
	document.cookie = curCookie;
      };
      var _deleteCookie = function() {
	var secure = location.protocol == 'https:';
	if (_getCookie()) {
	  if (mt.cookie.domain && mt.cookie.domain.match(/^\.?localhost$/))
	    mt.cookie.domain = null;
	  var curCookie = mt.cookie.name + "=" +
	    (mt.cookie.path ? "; path=" + mt.cookie.path : "") +
	    (mt.cookie.domain ? "; domain=" + mt.cookie.domain : "") +
	    (secure ? "; secure" : "") +
	    "; expires=Thu, 01-Jan-70 00:00:01 GMT";
	  document.cookie = curCookie;
	}	
      };
      $.fn.movabletype.clearUser = function() {
	this.user = null;
	jQuery.authHappened = false;
	_deleteCookie();
      };
      this.initialize = function() {
	this.user = $.fn.movabletype.getUser();
	$(document).ready( function() {
	    /*if (mt.blog.id && mt.blog.registration.required) {*/
	      /***
	       * If request contains a '#_login' or '#_logout' hash, use this to
	       * also delete the blog-side user cookie, since we're coming back from
	       * a login, logout or edit profile operation.
	       */
	      if (jQuery.needsAuth) {
		// clear any logged in state
		$.fn.movabletype.clearUser();
		window.location.hash.match( /^#_log(in|out)/ );
		if (RegExp.$1 == 'in') {
		  $.fn.movabletype.fetchUser(function(u) { 
		      $.fn.movabletype.setUser(u); 
		      var url = document.URL;
		      url = url.replace(/#.+$/, '');
		      url += '#loggedin';
		      location.href = url;
		    });
		} else if (RegExp.$1 == "out") {
		  $.fn.onauthchange.fire();
		  var url = document.URL;
		  url = url.replace(/#.+$/, '');
		  url += '#loggedout';
		  location.href = url;
		} 
	      } else {
                $.fn.onauthchange.fire();
		/***
		 * Uncondition this call to fetch the current user state (if available)
		 * from MT upon page load if no user cookie is already present.
		 * This is okay if you have a private install, such as an Intranet;
		 * not recommended for public web sites!
		 */
		/*
		if ( settings.isPreview && !$.fn.movabletype.user ) {
		  $.fn.movabletype.fetchUser(function(u) { return $.fn.movabletype.setUser(u); });
		}
		*/
	      }
	      /*}*/
	});
	return this;
      };
      return this.initialize();
    };
    jQuery.needsAuth = ( window.location.hash && window.location.hash.match( /^#_log(in|out)/ ) ) ? true : false;
})(jQuery);
$.fn.movabletype();
