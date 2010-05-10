(function($){
  $.fn.ajaxSubmit.debug = true;
  $.fn.commentForm = function(options) {
    var defaults = {
      speed: 'slow',
      entryId: 0,
      parentId: 0,
      leaveCommentMsg: 'Leave a comment...',
      insertMethod: 'append',
      replySelector: 'a.reply',
      onSuccess: null,
      target: '#comments-list'
    };
    var settings = $.extend( {}, defaults, options);
    return this.each(function() {
        var f = $(this);
        var id = f.attr('id');
        var action = f.attr('action');
        var method = f.attr('method');
        var entry_id = $('[name=entry_id]').val();
        if (!entry_id) entry_id = settings.entryId;
        // TODO - bail if no entry_id specified?
        
        // initialize the overlay
        f.append('<div class="spinner"></div><div class="spinner-status"></div>');
        // clear focus event, and initialize the 'Leave a comment...' message
        f.find('textarea').unbind('focus').val(settings.leaveCommentMsg).focus( function() { 
		if ($(this).val() == settings.leaveCommentMsg) $(this).val(''); 
        });
        // for now, let's kill the preview button
        // in the future this will only happen when live previews are activated
        f.find('input.comment-preview').hide();
        // clear any submit events, so we can make our own
        //f.unbind('submit');
        f.submit( function(e){
            var form = $(this);
            $(this).find('[name=ajax]').val('1');
            $(this).find('[name=entry_id]').val(entry_id);
            $(this).find('[name=preview]').val('0');
            $(this).find('[name=parent_id]').val(settings.parentId);
            $(this).find('[name=armor]').val(mt.blog.comments.armor);
            $(this).ajaxSubmit({
              contentType: 'application/x-www-form-urlencoded; charset=utf-8',
              iframe: false,
              type: 'post',
              dataType: null,
              clearForm: true,
              beforeSubmit: function(formData, jqForm, options) {
                var queryString = $.param(formData); // for debugging
                $('#'+id+' .spinner, #'+id+' .spinner-status').fadeIn('fast').css('height',f.height());
              },
              success: function(responseText, statusText) {
                  $('#'+id+' .spinner, #'+id+' .spinner-status').fadeOut();
                  var comment = $(responseText).hide();
                  var cid = comment.attr('id').substr(8);
                  var parent;
                  if (settings.parentId) {
                      parent = comment.wrap('<div style="margin-left:20px;" class="comment-replies"></div>').parent();
                  }
                  if (settings.insertMethod == 'append') $(settings.target).append(parent ? parent : comment);
                  if (settings.insertMethod == 'after') $(settings.target).after(parent ? parent : comment);
                  if (settings.onSuccess) settings.onSuccess(form,comment,0);
                  else { comment.fadeIn(); }
                  if (comment.find(settings.replySelector)) {
                      var opts = $.extend( {}, settings, { parentId: cid, target: comment });
                      comment.find(settings.replySelector).reply(opts);
                  }
                }
              });
            return false;
          });
      });
  };
  $.fn.reply = function(options) {
    var defaults = {
      speed: 'slow',
      sourceForm: $('#comments-form'),
      target: '#comments-list'
    };
    var self;
    var settings = $.extend( {}, defaults, options);
    var clicked = Array();
    var onReplyClick = function() {
      var replyLink = $(this);
      var pid_e = $(this).closest('.comment');
      var pid = pid_e.attr('id').substr(8);
      var pauthor_e = $(this).closest('.byline').find('.vcard.author');
      var pauthor = pauthor_e.html();
      if (!clicked[pid]) {
        // initing the form:
        // 1. clone the source
        var newForm = settings.sourceForm.clone();
        // * making sure the IDs are unique for validity
        var newid = newForm.attr('id') + '-' + pid;
        newForm.hide().attr('id',newid);
        replyLink.after(newForm);
        // * running "commentForm on it"
        newForm.commentForm({
          parentId: pid,
          insertMethod: 'after',
          target: pid_e,
          // maybe the comment should be hidden prior to it being shown?
          onSuccess: function(f,c,pid) { 
              replyLink.removeClass('expanded').addClass('collapsed');
              f.slideUp('fast', function() { c.slideDown(settings.speed) } );
            }
        });
        clicked[pid] = newForm;
        $(this).addClass('expanded');
        clicked[pid].slideDown(settings.speed);
      } else if (replyLink.hasClass('expanded')) {
        clicked[pid].slideUp(settings.speed);
        $(this).removeClass('expanded').addClass('collapsed');
      } else if (replyLink.hasClass('collapsed')) {
        clicked[pid].slideDown(settings.speed);
        $(this).addClass('expanded').removeClass('collapsed');
      } else {
        alert("Fatal error. A form was never initialized for this element.");
      }
    };
    return this.each(function() {
        $(this).click( onReplyClick );
    });
  };
})(jQuery);
