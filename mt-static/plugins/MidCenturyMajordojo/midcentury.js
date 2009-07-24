/*
 * This file is for scripts that are specific to the Mid-Century Theme
 */
$(document).ready(function(){
    if ($('#comments-form')) {
      var form = $('#comments-form').commentForm( { 
	      insertMethod: 'append',
	      target: '.comments-content'
	  });
      $('.reply').reply({
        sourceForm: form
      });
    };
    if ($('#comments-form') || $('#contact-form')) {
      $('#comment-greeting').greet({
        loggedInMessage: 'Welcome back, %u! (%p | %o)',
        loggedOutMessage: (mt.blog.registration.required ? '%i to leave a comment.' : '%i to create a custom profile for yourself.\
'),
        loginText: 'Sign in',
        mode: 'mtpro',
        editProfileText: 'edit profile',
        logoutText: 'sign out',
        returnToURL: returnto
      });
      $('#comments-open-data').onauthchange( function(e,u) {
	      if (u.is_authenticated) { $(this).hide(); } else { $(this).show(); } 
	  });
    };
    // Sign-in auth tab switcher - auth_types is defined in the login page.
    $('#auth-options li').click(function(){
        authID = $(this).attr('id').replace("signin_option_", "");
        authOption = $("#signin_option_" + authID);
        if (authOption) {
            for (var i = 0; i < auth_types.length; i++) {
                var auth_type = auth_types[i];
                if (auth_type == authID) {
                    $('#signin_with_' + auth_type).show();
                    $('#signin_option_' + auth_type).addClass('selected');
                } else {
                    $('#signin_with_' + auth_type).hide();
                    $('#signin_option_' + auth_type).removeClass('selected');
                }
            }
        };
    })
  var changeUserpic = $('#userpic-field .field-content #change-userpic');
  var cancelUserpic = $('#userpic-field .field-content #cancel-userpic');
  var removeUserpic = $('#userpic-field .field-content #remove-userpic');
  var changePassword = $('#profile a#change-password');
  // hide input change link present
  $(changeUserpic).siblings("input").hide();
  // onclick: hide link, img. show input
  $(changePassword).click(function() {
      var speed = 500;
      $(this).hide();
      $('#password-fields').show(speed);
  });
  if (changeUserpic.size()) {
    $(changeUserpic).click(function() {
      var speed = 500;
      $(this).hide(speed);
      $(this).parent().siblings("img").hide(speed);
      $(this).parent().siblings("input").show(speed);
      cancelUserpic.show(speed);
      removeUserpic.hide(speed);
      $(this).parent().addClass('active');
      return false;
    });
    $(cancelUserpic).click(function() {
      var speed = 500;
      $(this).hide(speed);
      $(this).siblings("img").show(speed);
      $(this).siblings("input").hide(speed);
      removeUserpic.show(speed);
      changeUserpic.show(speed);
      $(this).parent().removeClass('active');
      return false;
    });
  };
  if (removeUserpic.size()) {
    $(removeUserpic).click(function() {
      var id = $('[name="id"]').val();
      var token = $('[name="magic_token"]').val();
      var postData = { __mode: 'remove_userpic', user_id: id, magic_token: token  };
      $.post(mt.blog.community.script, postData,
	     function(data){
	       var speed = 500;
	       $(removeUserpic).hide(speed);
               $(removeUserpic).parent().siblings("img").hide(speed);
               $(removeUserpic).parent().siblings("input").show(speed);
	       $(changeUserpic).hide(speed);
	     }
      );
      return false;
	});
  };
});
              

function galleryNext() {
    var nextItemNumber = currentItem + 1;
    if (nextItemNumber <= lastItem ) {
        var currentItemId = 'gallery-item-' + currentItem;
        var nextItemId = 'gallery-item-' + nextItemNumber;
        var currentItemObj = document.getElementById(currentItemId);
        var nextItemObj = document.getElementById(nextItemId);
        $(currentItemObj).fadeOut(400, function() {
            $(nextItemObj).fadeIn(400);
        });
        currentItem = nextItemNumber;
        document.getElementById('showcase-prev').className = 'active';
        if (currentItem == lastItem) {
            document.getElementById('showcase-next').className = 'inactive';
        } else {
            document.getElementById('showcase-next').className = 'active';
        }
    }
}
function galleryPrev() {
    var prevItemNumber = currentItem - 1;
    if (prevItemNumber > 0) {
        var currentItemId = 'gallery-item-' + currentItem;
        var prevItemId = 'gallery-item-' + prevItemNumber;
        var currentItemObj = document.getElementById(currentItemId);
        var prevItemObj = document.getElementById(prevItemId);
        $(currentItemObj).fadeOut(400, function() {
            $(prevItemObj).fadeIn(400);
        });
        currentItem = prevItemNumber;
        document.getElementById('showcase-next').className = 'active';
        if (currentItem == 1) {
            document.getElementById('showcase-prev').className = 'inactive';
        } else {
            document.getElementById('showcase-prev').className = 'active';
        }
    }
}

function dialogShow(imageUrl,imageHeight,imageWidth,imageId) {
    var dialogImage = document.createElement('img');
    $("#dialog-content").append(dialogImage);
    $(dialogImage).attr("src",imageUrl);
    
    var dialogWidth = imageWidth + 40;
    if ((imageHeight > imageWidth) && (imageHeight > 450)) { // portrait
        $(dialogImage).attr("height","400");
        var imageRatio = 400 / imageHeight;
        var dialogWidth = parseInt(imageWidth * imageRatio) + 40;
    } else { // landscape
        if (imageWidth > 500) {
            $(dialogImage).attr("width","500");
            dialogWidth = 540;
        }
    }
    // create title and description
    var dialogText = document.createElement('div');
    $(dialogText).attr("id","dialog-text");
    var dialogTextInner = document.createElement('div');
    $(dialogTextInner).attr("id","dialog-text-inner");
    $(dialogTextInner).attr("onmouseover","dialogTextShow('dialog-text')");
    $(dialogTextInner).attr("onmouseout","dialogTextHide('dialog-text')");
    var dialogTitle = document.createElement('h2');
    var dialogDescription = document.createElement('div');
    
    // get content from gallery
    var wrapper = document.getElementById(imageId);
    var imageTitle = $(wrapper).find("h3").text();
    var imageDescription = $(wrapper).find("div").html();
    
    $(dialogTitle).text(imageTitle);
    $(dialogDescription).html(imageDescription);
    
    $("#dialog-content").append(dialogText);
    $(dialogText).append(dialogTextInner);
    $(dialogTextInner).append(dialogTitle);
    $(dialogTextInner).append(dialogDescription);
    
    $(dialogImage).hover(
        function () {
            $(dialogText).show();
        },
        function () {
            $(dialogText).hide();
        }
    );

    $("#dialog-inner").css("width",dialogWidth);
    
    $("#overlay").show();
    $("#dialog").show();
}
function dialogClose() {
    $("#overlay").hide();
    $("#dialog").hide();
    $("#dialog-content").empty();
}




