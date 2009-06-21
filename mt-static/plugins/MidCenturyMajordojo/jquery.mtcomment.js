(function($){
  $.fn.reply = function(options) {
    var defaults = {
      speed: 'slow',
      entryId: null,
      formSource: '#comments-form',
      formClass: 'ajax-comments-form',
      leaveCommentMsg: 'Leave a comment...'
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
      var form = clicked[pid];
      if (!form) {
        clicked[pid] = initForm( replyLink, pid, pid_e );
        $(this).addClass('expanded');
        clicked[pid].slideDown(settings.speed);
      } else if (form.hasClass('expanded')) {
        $(this).siblings('.'+settings.formClass).slideUp(settings.speed);
        $(this).removeClass('expanded');
        $(this).addClass('collapsed');
      } else if (form.hasClass('collapsed')) {
        $(this).siblings('.'+settings.formClass).slideDown(settings.speed);
        $(this).addClass('expanded');
        $(this).removeClass('collapsed');
      } else {
        alert("Fatal error. A form was never initialized for this element.");
      }
    };
    return this.each(function() {
        obj = $(this);
        self = obj;
        self.click( onReplyClick );
      });
    function initForm( target, parent, parent_elem ) {
      var form_html = $(settings.formSource).html();
      var f = target.after('<form class="'+settings.formClass+'">'+form_html+'</form>').siblings('.'+settings.formClass);
      f.css({ 'display':'none', 'position':'relative','margin':'0','padding':'0' });
      f.append('<div id="spinner"></div><div id="spinner-status"></div>');
      f.find('textarea').unbind('focus').val(settings.leaveCommentMsg).focus( function() { $(this).val(''); });
      f.find('input#comment-preview').replaceWith('');
      f.unbind('submit');
      f.submit( function(e){
          // TODO - use classes, not IDs
          // TODO - add config variables
          $(this).find('#ajax').val('1');
          $(this).find('#parent_id').val(parent);
          $(this).find('#armor').val(mt.blog.comments.armor);
          // TODO - fix! this is not submitting any more
          $(this).ajaxSubmit({
              contentType: 'application/x-www-form-urlencoded; charset=utf-8',
              url: mt.blog.comments.script,
              type: 'post',
              clearForm: true,
              beforeSubmit: function(formData, jqForm, options) {
                var queryString = $.param(formData); 
                $('#spinner, #spinner-status').fadeIn('fast').css('height',f.height());
              },
              success: function(responseText, statusText) {
                $('#spinner, #spinner-status').fadeOut( function() { f.hide(); target.removeClass('expanded'); });
                var comment = parent_elem.after(responseText).siblings('.comment');
                comment.fadeIn('slow');
                comment.find('a.reply').click( onReplyClick );
              }
            });
          return false;
        });
      return f;
    };
  };
})(jQuery);
