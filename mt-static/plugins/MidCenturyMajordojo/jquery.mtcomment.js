(function($){
  $.fn.reply = function(options) {
    var defaults = {
    speed: 'slow',
    leaveCommentMsg: 'Leave a comment...'
    };
    var self;
    var settings = $.extend( {}, defaults, options);
    var clicked = Array();
    return this.each(function() {
        obj = $(this);
        self = obj;
        self.click( function() { 
            var replyLink = $(this);
            var pid_e = $(this).closest('.comment');
            var pid = pid_e.attr('id').substr(8);
            var pauthor_e = $(this).closest('.byline').find('.vcard.author');
            var pauthor = pauthor_e.html();
            if (clicked[pid] == 1) {
              clicked[pid] = 2;
              $(this).siblings('#comments-form').slideUp(settings.speed);
              $(this).removeClass('expanded');
            } else if (clicked[pid] == 2) {
              clicked[pid] = 1;
              $(this).siblings('#comments-form').slideDown(settings.speed);
              $(this).addClass('expanded');
            } else {
              clicked[pid] = 1;
              var form_html = $('#comments-form').html();
              var form = $(this).after('<form id="comments-form">'+form_html+'</form>').siblings('#comments-form');
              form.attr({
                method: 'post',
                action: mt.blog.comments.script
              });
              // Create containers for status messaging
              $(this).addClass('expanded');
              form.append('<div id="spinner"></div><div id="spinner-status"></div>');
              //form.find('input#comment-submit').replaceWith('<input type="button" value="Submit" id="comment-submit" />');
              form.find('textarea').unbind('focus').val(settings.leaveCommentMsg).focus( function() { $(this).val(''); });
              form.find('input#comment-preview').replaceWith('');
              form.slideDown(settings.speed);
              form.unbind('submit');
              form.submit( function(e){
                  // flag this as an ajax request
                  // TODO - use classes, not IDs
                  // TODO - prime new comments with proper callbacks (reply())
                  // TODO - add config variables
                  form.find('#ajax').val('1');
                  form.find('#parent_id').val(pid);
                  form.find('#armor').val(mt.blog.comments.armor);
                  $(this).ajaxSubmit({
                    contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                    beforeSubmit: function(formData, jqForm, options) {
                      var queryString = $.param(formData); 
                      alert('About to submit: \n\n' + queryString); 
                      $('#spinner, #spinner-status').fadeIn('fast').css('height',form.height());
                    },
                    success: function(responseText, statusText) {
                      $('#spinner, #spinner-status').fadeOut( function() { form.hide(); replyLink.removeClass('expanded'); });
                      pid_e.after(responseText).siblings('.comment').fadeIn('slow');
                    }
                  });
                  return false;
              });
            }
        });
      });       
  };
})(jQuery);
