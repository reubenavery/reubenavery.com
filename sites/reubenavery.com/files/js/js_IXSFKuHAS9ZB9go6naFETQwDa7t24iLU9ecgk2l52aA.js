(function($) {

Drupal.wysiwyg.editor.init.ckeditor = function(settings) {
  // Plugins must only be loaded once. Only the settings from the first format
  // will be used but they're identical anyway.
  var registeredPlugins = {};
  for (var format in settings) {
    if (Drupal.settings.wysiwyg.plugins[format]) {
      // Register native external plugins.
      // Array syntax required; 'native' is a predefined token in JavaScript.
      for (var pluginName in Drupal.settings.wysiwyg.plugins[format]['native']) {
        if (!registeredPlugins[pluginName]) {
          var plugin = Drupal.settings.wysiwyg.plugins[format]['native'][pluginName];
          CKEDITOR.plugins.addExternal(pluginName, plugin.path, plugin.fileName);
          registeredPlugins[pluginName] = true;
        }
      }
      // Register Drupal plugins.
      for (var pluginName in Drupal.settings.wysiwyg.plugins[format].drupal) {
        if (!registeredPlugins[pluginName]) {
          Drupal.wysiwyg.editor.instance.ckeditor.addPlugin(pluginName, Drupal.settings.wysiwyg.plugins[format].drupal[pluginName], Drupal.settings.wysiwyg.plugins.drupal[pluginName]);
          registeredPlugins[pluginName] = true;
        }
      }
    }
    // Register Font styles (versions 3.2.1 and above).
    if (Drupal.settings.wysiwyg.configs.ckeditor[format].stylesSet) {
      CKEDITOR.stylesSet.add(format, Drupal.settings.wysiwyg.configs.ckeditor[format].stylesSet);
    }
  }
};


/**
 * Attach this editor to a target element.
 */
Drupal.wysiwyg.editor.attach.ckeditor = function(context, params, settings) {
  // Apply editor instance settings.
  CKEDITOR.config.customConfig = '';

  var $drupalToolbar = $('#toolbar', Drupal.overlayChild ? window.parent.document : document);

  settings.on = {
    instanceReady: function(ev) {
      var editor = ev.editor;
      // Get a list of block, list and table tags from CKEditor's XHTML DTD.
      // @see http://docs.cksource.com/CKEditor_3.x/Developers_Guide/Output_Formatting.
      var dtd = CKEDITOR.dtd;
      var tags = CKEDITOR.tools.extend({}, dtd.$block, dtd.$listItem, dtd.$tableContent);
      // Set source formatting rules for each listed tag except <pre>.
      // Linebreaks can be inserted before or after opening and closing tags.
      if (settings.apply_source_formatting) {
        // Mimic FCKeditor output, by breaking lines between tags.
        for (var tag in tags) {
          if (tag == 'pre') {
            continue;
          }
          this.dataProcessor.writer.setRules(tag, {
            indent: true,
            breakBeforeOpen: true,
            breakAfterOpen: false,
            breakBeforeClose: false,
            breakAfterClose: true
          });
        }
      }
      else {
        // CKEditor adds default formatting to <br>, so we want to remove that
        // here too.
        tags.br = 1;
        // No indents or linebreaks;
        for (var tag in tags) {
          if (tag == 'pre') {
            continue;
          }
          this.dataProcessor.writer.setRules(tag, {
            indent: false,
            breakBeforeOpen: false,
            breakAfterOpen: false,
            breakBeforeClose: false,
            breakAfterClose: false
          });
        }
      }
    },

    pluginsLoaded: function(ev) {
      // Override the conversion methods to let Drupal plugins modify the data.
      var editor = ev.editor;
      if (editor.dataProcessor && Drupal.settings.wysiwyg.plugins[params.format]) {
        editor.dataProcessor.toHtml = CKEDITOR.tools.override(editor.dataProcessor.toHtml, function(originalToHtml) {
          // Convert raw data for display in WYSIWYG mode.
          return function(data, fixForBody) {
            for (var plugin in Drupal.settings.wysiwyg.plugins[params.format].drupal) {
              if (typeof Drupal.wysiwyg.plugins[plugin].attach == 'function') {
                data = Drupal.wysiwyg.plugins[plugin].attach(data, Drupal.settings.wysiwyg.plugins.drupal[plugin], editor.name);
                data = Drupal.wysiwyg.instances[params.field].prepareContent(data);
              }
            }
            return originalToHtml.call(this, data, fixForBody);
          };
        });
        editor.dataProcessor.toDataFormat = CKEDITOR.tools.override(editor.dataProcessor.toDataFormat, function(originalToDataFormat) {
          // Convert WYSIWYG mode content to raw data.
          return function(data, fixForBody) {
            data = originalToDataFormat.call(this, data, fixForBody);
            for (var plugin in Drupal.settings.wysiwyg.plugins[params.format].drupal) {
              if (typeof Drupal.wysiwyg.plugins[plugin].detach == 'function') {
                data = Drupal.wysiwyg.plugins[plugin].detach(data, Drupal.settings.wysiwyg.plugins.drupal[plugin], editor.name);
              }
            }
            return data;
          };
        });
      }
    },

    selectionChange: function (event) {
      var pluginSettings = Drupal.settings.wysiwyg.plugins[params.format];
      if (pluginSettings && pluginSettings.drupal) {
        $.each(pluginSettings.drupal, function (name) {
          var plugin = Drupal.wysiwyg.plugins[name];
          if ($.isFunction(plugin.isNode)) {
            var node = event.data.selection.getSelectedElement();
            var state = plugin.isNode(node ? node.$ : null) ? CKEDITOR.TRISTATE_ON : CKEDITOR.TRISTATE_OFF;
            event.editor.getCommand(name).setState(state);
          }
        });
      }
    },

    focus: function(ev) {
      Drupal.wysiwyg.activeId = ev.editor.name;
    },

    afterCommandExec: function(ev) {
      // Fix Drupal toolbar obscuring editor toolbar in fullscreen mode.
      if (ev.data.name != 'maximize') {
        return;
      }
      if (ev.data.command.state == CKEDITOR.TRISTATE_ON) {
        $drupalToolbar.hide();
      }
      else {
        $drupalToolbar.show();
      }
    }
  };

  // Attach editor.
  CKEDITOR.replace(params.field, settings);
};

/**
 * Detach a single or all editors.
 *
 * @todo 3.x: editor.prototype.getInstances() should always return an array
 *   containing all instances or the passed in params.field instance, but
 *   always return an array to simplify all detach functions.
 */
Drupal.wysiwyg.editor.detach.ckeditor = function (context, params, trigger) {
  var method = (trigger == 'serialize') ? 'updateElement' : 'destroy';
  if (typeof params != 'undefined') {
    var instance = CKEDITOR.instances[params.field];
    if (instance) {
      instance[method]();
    }
  }
  else {
    for (var instanceName in CKEDITOR.instances) {
      if (CKEDITOR.instances.hasOwnProperty(instanceName)) {
        CKEDITOR.instances[instanceName][method]();
      }
    }
  }
};

Drupal.wysiwyg.editor.instance.ckeditor = {
  addPlugin: function(pluginName, settings, pluginSettings) {
    CKEDITOR.plugins.add(pluginName, {
      // Wrap Drupal plugin in a proxy pluygin.
      init: function(editor) {
        if (settings.css) {
          editor.on('mode', function(ev) {
            if (ev.editor.mode == 'wysiwyg') {
              // Inject CSS files directly into the editing area head tag.
              $('head', $('#cke_contents_' + ev.editor.name + ' iframe').eq(0).contents()).append('<link rel="stylesheet" href="' + settings.css + '" type="text/css" >');
            }
          });
        }
        if (typeof Drupal.wysiwyg.plugins[pluginName].invoke == 'function') {
          var pluginCommand = {
            exec: function (editor) {
              var data = { format: 'html', node: null, content: '' };
              var selection = editor.getSelection();
              if (selection) {
                data.node = selection.getSelectedElement();
                if (data.node) {
                  data.node = data.node.$;
                }
                if (selection.getType() == CKEDITOR.SELECTION_TEXT) {
                  if (CKEDITOR.env.ie) {
                    data.content = selection.getNative().createRange().text;
                  }
                  else {
                    data.content = selection.getNative().toString();
                  }
                }
                else if (data.node) {
                  // content is supposed to contain the "outerHTML".
                  data.content = data.node.parentNode.innerHTML;
                }
              }
              Drupal.wysiwyg.plugins[pluginName].invoke(data, pluginSettings, editor.name);
            }
          };
          editor.addCommand(pluginName, pluginCommand);
        }
        editor.ui.addButton(pluginName, {
          label: settings.iconTitle,
          command: pluginName,
          icon: settings.icon
        });

        // @todo Add button state handling.
      }
    });
  },
  prepareContent: function(content) {
    // @todo Don't know if we need this yet.
    return content;
  },

  insert: function(content) {
    content = this.prepareContent(content);
    CKEDITOR.instances[this.field].insertHtml(content);
  },

  setContent: function (content) {
    CKEDITOR.instances[this.field].setData(content);
  },

  getContent: function () {
    return CKEDITOR.instances[this.field].getData();
  }
};

})(jQuery);
;
(function($) {

/**
 * Attach this editor to a target element.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 * @param params
 *   An object containing input format parameters. Default parameters are:
 *   - editor: The internal editor name.
 *   - theme: The name/key of the editor theme/profile to use.
 *   - field: The CSS id of the target element.
 * @param settings
 *   An object containing editor settings for all enabled editor themes.
 */
Drupal.wysiwyg.editor.attach.none = function(context, params, settings) {
  if (params.resizable) {
    var $wrapper = $('#' + params.field).parents('.form-textarea-wrapper:first');
    $wrapper.addClass('resizable');
    if (Drupal.behaviors.textarea) {
      Drupal.behaviors.textarea.attach();
    }
  }
};

/**
 * Detach a single or all editors.
 *
 * The editor syncs its contents back to the original field before its instance
 * is removed.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 * @param params
 *   (optional) An object containing input format parameters. If defined,
 *   only the editor instance in params.field should be detached. Otherwise,
 *   all editors should be detached and saved, so they can be submitted in
 *   AJAX/AHAH applications.
 * @param trigger
 *   A string describing why the editor is being detached.
 *   Possible triggers are:
 *   - unload: (default) Another or no editor is about to take its place.
 *   - move: Currently expected to produce the same result as unload.
 *   - serialize: The form is about to be serialized before an AJAX request or
 *     a normal form submission. If possible, perform a quick detach and leave
 *     the editor's GUI elements in place to avoid flashes or scrolling issues.
 * @see Drupal.detachBehaviors
 */
Drupal.wysiwyg.editor.detach.none = function (context, params, trigger) {
  if (typeof params != 'undefined' && (trigger != 'serialize')) {
    var $wrapper = $('#' + params.field).parents('.form-textarea-wrapper:first');
    $wrapper.removeOnce('textarea').removeClass('.resizable-textarea')
      .find('.grippie').remove();
  }
};

/**
 * Instance methods for plain text areas.
 */
Drupal.wysiwyg.editor.instance.none = {
  insert: function(content) {
    var editor = document.getElementById(this.field);

    // IE support.
    if (document.selection) {
      editor.focus();
      var sel = document.selection.createRange();
      sel.text = content;
    }
    // Mozilla/Firefox/Netscape 7+ support.
    else if (editor.selectionStart || editor.selectionStart == '0') {
      var startPos = editor.selectionStart;
      var endPos = editor.selectionEnd;
      editor.value = editor.value.substring(0, startPos) + content + editor.value.substring(endPos, editor.value.length);
    }
    // Fallback, just add to the end of the content.
    else {
      editor.value += content;
    }
  },

  setContent: function (content) {
    $('#' + this.field).val(content);
  },

  getContent: function () {
    return $('#' + this.field).val();
  }
};

})(jQuery);
;
(function ($) {

// @todo Array syntax required; 'break' is a predefined token in JavaScript.
Drupal.wysiwyg.plugins['break'] = {

  /**
   * Return whether the passed node belongs to this plugin.
   */
  isNode: function(node) {
    return ($(node).is('img.wysiwyg-break'));
  },

  /**
   * Execute the button.
   */
  invoke: function(data, settings, instanceId) {
    if (data.format == 'html') {
      // Prevent duplicating a teaser break.
      if ($(data.node).is('img.wysiwyg-break')) {
        return;
      }
      var content = this._getPlaceholder(settings);
    }
    else {
      // Prevent duplicating a teaser break.
      // @todo data.content is the selection only; needs access to complete content.
      if (data.content.match(/<!--break-->/)) {
        return;
      }
      var content = '<!--break-->';
    }
    if (typeof content != 'undefined') {
      Drupal.wysiwyg.instances[instanceId].insert(content);
    }
  },

  /**
   * Replace all <!--break--> tags with images.
   */
  attach: function(content, settings, instanceId) {
    content = content.replace(/<!--break-->/g, this._getPlaceholder(settings));
    return content;
  },

  /**
   * Replace images with <!--break--> tags in content upon detaching editor.
   */
  detach: function(content, settings, instanceId) {
    var $content = $('<div>' + content + '</div>'); // No .outerHTML() in jQuery :(
    // #404532: document.createComment() required or IE will strip the comment.
    // #474908: IE 8 breaks when using jQuery methods to replace the elements.
    // @todo Add a generic implementation for all Drupal plugins for this.
    $.each($('img.wysiwyg-break', $content), function (i, elem) {
      elem.parentNode.insertBefore(document.createComment('break'), elem);
      elem.parentNode.removeChild(elem);
    });
    return $content.html();
  },

  /**
   * Helper function to return a HTML placeholder.
   */
  _getPlaceholder: function (settings) {
    return '<img src="' + settings.path + '/images/spacer.gif" alt="&lt;--break-&gt;" title="&lt;--break--&gt;" class="wysiwyg-break drupal-content" />';
  }
};

})(jQuery);
;
/**
 * EpicEditor - An Embeddable JavaScript Markdown Editor (https://github.com/OscarGodson/EpicEditor)
 * Copyright (c) 2011-2012, Oscar Godson. (MIT Licensed)
 */(function(e,t){function n(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])}function r(e,t){for(var n in t)t.hasOwnProperty(n)&&(e.style[n]=t[n])}function i(t,n){var r=t,i=null;return e.getComputedStyle?i=document.defaultView.getComputedStyle(r,null).getPropertyValue(n):r.currentStyle&&(i=r.currentStyle[n]),i}function s(e,t,n){var s={},o;if(t==="save"){for(o in n)n.hasOwnProperty(o)&&(s[o]=i(e,o));r(e,n)}else t==="apply"&&r(e,n);return s}function o(e){var t=parseInt(i(e,"border-left-width"),10)+parseInt(i(e,"border-right-width"),10),n=parseInt(i(e,"padding-left"),10)+parseInt(i(e,"padding-right"),10),r=e.offsetWidth,s;return isNaN(t)&&(t=0),s=t+n+r,s}function u(e){var t=parseInt(i(e,"border-top-width"),10)+parseInt(i(e,"border-bottom-width"),10),n=parseInt(i(e,"padding-top"),10)+parseInt(i(e,"padding-bottom"),10),r=parseInt(i(e,"height"),10),s;return isNaN(t)&&(t=0),s=t+n+r,s}function a(e,t,r){r=r||"";var i=t.getElementsByTagName("head")[0],s=t.createElement("link");n(s,{type:"text/css",id:r,rel:"stylesheet",href:e,name:e,media:"screen"}),i.appendChild(s)}function f(e,t,n){e.className=e.className.replace(t,n)}function l(e){return e.contentDocument||e.contentWindow.document}function c(e){var t;return typeof document.body.innerText=="string"?t=e.innerText:(t=e.innerHTML.replace(/<br>/gi,"\n"),t=t.replace(/<(?:.|\n)*?>/gm,""),t=t.replace(/&lt;/gi,"<"),t=t.replace(/&gt;/gi,">")),t}function h(e,t){return t=t.replace(/</g,"&lt;"),t=t.replace(/>/g,"&gt;"),t=t.replace(/\n/g,"<br>"),t=t.replace(/<br>\s/g,"<br>&nbsp;"),t=t.replace(/\s\s\s/g,"&nbsp; &nbsp;"),t=t.replace(/\s\s/g,"&nbsp; "),t=t.replace(/^ /,"&nbsp;"),e.innerHTML=t,!0}function p(e){return e.replace(/\u00a0/g," ").replace(/&nbsp;/g," ")}function d(){var e=-1,t=navigator.userAgent,n;return navigator.appName=="Microsoft Internet Explorer"&&(n=/MSIE ([0-9]{1,}[\.0-9]{0,})/,n.exec(t)!=null&&(e=parseFloat(RegExp.$1,10))),e}function v(){var t=e.navigator;return t.userAgent.indexOf("Safari")>-1&&t.userAgent.indexOf("Chrome")==-1}function m(){var t=e.navigator;return t.userAgent.indexOf("Firefox")>-1&&t.userAgent.indexOf("Seamonkey")==-1}function g(e){var t={};return e&&t.toString.call(e)==="[object Function]"}function y(){var e=arguments[0]||{},n=1,r=arguments.length,i=!1,s,o,u,a;typeof e=="boolean"&&(i=e,e=arguments[1]||{},n=2),typeof e!="object"&&!g(e)&&(e={}),r===n&&(e=this,--n);for(;n<r;n++)if((s=arguments[n])!=null)for(o in s)if(s.hasOwnProperty(o)){u=e[o],a=s[o];if(e===a)continue;i&&a&&typeof a=="object"&&!a.nodeType?e[o]=y(i,u||(a.length!=null?[]:{}),a):a!==t&&(e[o]=a)}return e}function b(e){var n=this,r=e||{},i,s,o={container:"epiceditor",basePath:"epiceditor",textarea:t,clientSideStorage:!0,localStorageName:"epiceditor",useNativeFullscreen:!0,file:{name:null,defaultContent:"",autoSave:100},theme:{base:"/themes/base/epiceditor.css",preview:"/themes/preview/github.css",editor:"/themes/editor/epic-dark.css"},focusOnLoad:!1,shortcut:{modifier:18,fullscreen:70,preview:80},string:{togglePreview:"Toggle Preview Mode",toggleEdit:"Toggle Edit Mode",toggleFullscreen:"Enter Fullscreen"},parser:typeof marked=="function"?marked:null,autogrow:!1,button:{fullscreen:!0,preview:!0,bar:"auto"}},u,a={minHeight:80,maxHeight:!1,scroll:!0};n.settings=y(!0,o,r);var f=n.settings.button;n._fullscreenEnabled=typeof f=="object"?typeof f.fullscreen=="undefined"||f.fullscreen:f===!0,n._editEnabled=typeof f=="object"?typeof f.edit=="undefined"||f.edit:f===!0,n._previewEnabled=typeof f=="object"?typeof f.preview=="undefined"||f.preview:f===!0;if(typeof n.settings.parser!="function"||typeof n.settings.parser("TEST")!="string")n.settings.parser=function(e){return e};return n.settings.autogrow&&(n.settings.autogrow===!0?n.settings.autogrow=a:n.settings.autogrow=y(!0,a,n.settings.autogrow),n._oldHeight=-1),n.settings.theme.preview.match(/^https?:\/\//)||(n.settings.theme.preview=n.settings.basePath+n.settings.theme.preview),n.settings.theme.editor.match(/^https?:\/\//)||(n.settings.theme.editor=n.settings.basePath+n.settings.theme.editor),n.settings.theme.base.match(/^https?:\/\//)||(n.settings.theme.base=n.settings.basePath+n.settings.theme.base),typeof n.settings.container=="string"?n.element=document.getElementById(n.settings.container):typeof n.settings.container=="object"&&(n.element=n.settings.container),n.settings.file.name||(typeof n.settings.container=="string"?n.settings.file.name=n.settings.container:typeof n.settings.container=="object"&&(n.element.id?n.settings.file.name=n.element.id:(b._data.unnamedEditors||(b._data.unnamedEditors=[]),b._data.unnamedEditors.push(n),n.settings.file.name="__epiceditor-untitled-"+b._data.unnamedEditors.length))),n.settings.button.bar==="show"&&(n.settings.button.bar=!0),n.settings.button.bar==="hide"&&(n.settings.button.bar=!1),n._instanceId="epiceditor-"+Math.round(Math.random()*1e5),n._storage={},n._canSave=!0,n._defaultFileSchema=function(){return{content:n.settings.file.defaultContent,created:new Date,modified:new Date}},localStorage&&n.settings.clientSideStorage&&(this._storage=localStorage,this._storage[n.settings.localStorageName]&&n.getFiles(n.settings.file.name)===t&&(s=n._defaultFileSchema(),s.content=n.settings.file.defaultContent)),this._storage[n.settings.localStorageName]||(u={},u[n.settings.file.name]=n._defaultFileSchema(),u=JSON.stringify(u),this._storage[n.settings.localStorageName]=u),n._previewDraftLocation="__draft-",n._storage[n._previewDraftLocation+n.settings.localStorageName]=n._storage[n.settings.localStorageName],n._eeState={fullscreen:!1,preview:!1,edit:!1,loaded:!1,unloaded:!1},n.events||(n.events={}),this}b.prototype.load=function(t){function O(t){if(n.settings.button.bar!=="auto")return;if(Math.abs(g.y-t.pageY)>=5||Math.abs(g.x-t.pageX)>=5)h.style.display="block",p&&clearTimeout(p),p=e.setTimeout(function(){h.style.display="none"},1e3);g={y:t.pageY,x:t.pageX}}function M(e){e.keyCode==n.settings.shortcut.modifier&&(N=!0),e.keyCode==17&&(C=!0),N===!0&&e.keyCode==n.settings.shortcut.preview&&!n.is("fullscreen")&&(e.preventDefault(),n.is("edit")&&n._previewEnabled?n.preview():n._editEnabled&&n.edit()),N===!0&&e.keyCode==n.settings.shortcut.fullscreen&&n._fullscreenEnabled&&(e.preventDefault(),n._goFullscreen(T)),N===!0&&e.keyCode!==n.settings.shortcut.modifier&&(N=!1),e.keyCode==27&&n.is("fullscreen")&&n._exitFullscreen(T),C===!0&&e.keyCode==83&&(n.save(),e.preventDefault(),C=!1),e.metaKey&&e.keyCode==83&&(n.save(),e.preventDefault())}function _(e){e.keyCode==n.settings.shortcut.modifier&&(N=!1),e.keyCode==17&&(C=!1)}function D(t){var r;t.clipboardData?(t.preventDefault(),r=t.clipboardData.getData("text/plain"),n.editorIframeDocument.execCommand("insertText",!1,r)):e.clipboardData&&(t.preventDefault(),r=e.clipboardData.getData("Text"),r=r.replace(/</g,"&lt;"),r=r.replace(/>/g,"&gt;"),r=r.replace(/\n/g,"<br>"),r=r.replace(/\r/g,""),r=r.replace(/<br>\s/g,"<br>&nbsp;"),r=r.replace(/\s\s\s/g,"&nbsp; &nbsp;"),r=r.replace(/\s\s/g,"&nbsp; "),n.editorIframeDocument.selection.createRange().pasteHTML(r))}if(this.is("loaded"))return this;var n=this,o,u,f,c,h,p,m,g={y:-1,x:-1},y,b,w=!1,E=!1,S=!1,x=!1,T,N=!1,C=!1,k,L,A;n._eeState.startup=!0,n.settings.useNativeFullscreen&&(E=document.body.webkitRequestFullScreen?!0:!1,S=document.body.mozRequestFullScreen?!0:!1,x=document.body.requestFullscreen?!0:!1,w=E||S||x),v()&&(w=!1,E=!1),!n.is("edit")&&!n.is("preview")&&(n._eeState.edit=!0),t=t||function(){},o={chrome:'<div id="epiceditor-wrapper" class="epiceditor-edit-mode"><iframe frameborder="0" id="epiceditor-editor-frame"></iframe><iframe frameborder="0" id="epiceditor-previewer-frame"></iframe><div id="epiceditor-utilbar">'+(n._previewEnabled?'<button title="'+this.settings.string.togglePreview+'" class="epiceditor-toggle-btn epiceditor-toggle-preview-btn"></button> ':"")+(n._editEnabled?'<button title="'+this.settings.string.toggleEdit+'" class="epiceditor-toggle-btn epiceditor-toggle-edit-btn"></button> ':"")+(n._fullscreenEnabled?'<button title="'+this.settings.string.toggleFullscreen+'" class="epiceditor-fullscreen-btn"></button>':"")+"</div>"+"</div>",previewer:'<div id="epiceditor-preview"></div>',editor:"<!doctype HTML>"},n.element.innerHTML='<iframe scrolling="no" frameborder="0" id= "'+n._instanceId+'"></iframe>',n.element.style.height=n.element.offsetHeight+"px",u=document.getElementById(n._instanceId),n.iframeElement=u,n.iframe=l(u),n.iframe.open(),n.iframe.write(o.chrome),n.editorIframe=n.iframe.getElementById("epiceditor-editor-frame"),n.previewerIframe=n.iframe.getElementById("epiceditor-previewer-frame"),n.editorIframeDocument=l(n.editorIframe),n.editorIframeDocument.open(),n.editorIframeDocument.write(o.editor),n.editorIframeDocument.close(),n.previewerIframeDocument=l(n.previewerIframe),n.previewerIframeDocument.open(),n.previewerIframeDocument.write(o.previewer),f=n.previewerIframeDocument.createElement("base"),f.target="_blank",n.previewerIframeDocument.getElementsByTagName("head")[0].appendChild(f),n.previewerIframeDocument.close(),n.reflow(),a(n.settings.theme.base,n.iframe,"theme"),a(n.settings.theme.editor,n.editorIframeDocument,"theme"),a(n.settings.theme.preview,n.previewerIframeDocument,"theme"),n.iframe.getElementById("epiceditor-wrapper").style.position="relative",n.editorIframe.style.position="absolute",n.previewerIframe.style.position="absolute",n.editor=n.editorIframeDocument.body,n.previewer=n.previewerIframeDocument.getElementById("epiceditor-preview"),n.editor.contentEditable=!0,n.iframe.body.style.height=this.element.offsetHeight+"px",n.previewerIframe.style.left="-999999px",this.editorIframeDocument.body.style.wordWrap="break-word",d()>-1&&(this.previewer.style.height=parseInt(i(this.previewer,"height"),10)+2),this.open(n.settings.file.name),n.settings.focusOnLoad&&n.iframe.addEventListener("readystatechange",function(){n.iframe.readyState=="complete"&&n.focus()}),n.previewerIframeDocument.addEventListener("click",function(t){var r=t.target,i=n.previewerIframeDocument.body;r.nodeName=="A"&&r.hash&&r.hostname==e.location.hostname&&(t.preventDefault(),r.target="_self",i.querySelector(r.hash)&&(i.scrollTop=i.querySelector(r.hash).offsetTop))}),c=n.iframe.getElementById("epiceditor-utilbar"),y={},n._goFullscreen=function(t){this._fixScrollbars("auto");if(n.is("fullscreen")){n._exitFullscreen(t);return}w&&(E?t.webkitRequestFullScreen():S?t.mozRequestFullScreen():x&&t.requestFullscreen()),b=n.is("edit"),n._eeState.fullscreen=!0,n._eeState.edit=!0,n._eeState.preview=!0;var r=e.innerWidth,o=e.innerHeight,u=e.outerWidth,a=e.outerHeight;w||(a=e.innerHeight),y.editorIframe=s(n.editorIframe,"save",{width:u/2+"px",height:a+"px","float":"left",cssFloat:"left",styleFloat:"left",display:"block",position:"static",left:""}),y.previewerIframe=s(n.previewerIframe,"save",{width:u/2+"px",height:a+"px","float":"right",cssFloat:"right",styleFloat:"right",display:"block",position:"static",left:""}),y.element=s(n.element,"save",{position:"fixed",top:"0",left:"0",width:"100%","z-index":"9999",zIndex:"9999",border:"none",margin:"0",background:i(n.editor,"background-color"),height:o+"px"}),y.iframeElement=s(n.iframeElement,"save",{width:u+"px",height:o+"px"}),c.style.visibility="hidden",w||(document.body.style.overflow="hidden"),n.preview(),n.focus(),n.emit("fullscreenenter")},n._exitFullscreen=function(e){this._fixScrollbars(),s(n.element,"apply",y.element),s(n.iframeElement,"apply",y.iframeElement),s(n.editorIframe,"apply",y.editorIframe),s(n.previewerIframe,"apply",y.previewerIframe),n.element.style.width=n._eeState.reflowWidth?n._eeState.reflowWidth:"",n.element.style.height=n._eeState.reflowHeight?n._eeState.reflowHeight:"",c.style.visibility="visible",n._eeState.fullscreen=!1,w?E?document.webkitCancelFullScreen():S?document.mozCancelFullScreen():x&&document.exitFullscreen():document.body.style.overflow="auto",b?n.edit():n.preview(),n.reflow(),n.emit("fullscreenexit")},n.editor.addEventListener("keyup",function(){m&&e.clearTimeout(m),m=e.setTimeout(function(){n.is("fullscreen")&&n.preview()},250)}),T=n.iframeElement,c.addEventListener("click",function(e){var t=e.target.className;t.indexOf("epiceditor-toggle-preview-btn")>-1?n.preview():t.indexOf("epiceditor-toggle-edit-btn")>-1?n.edit():t.indexOf("epiceditor-fullscreen-btn")>-1&&n._goFullscreen(T)}),E?document.addEventListener("webkitfullscreenchange",function(){!document.webkitIsFullScreen&&n._eeState.fullscreen&&n._exitFullscreen(T)},!1):S?document.addEventListener("mozfullscreenchange",function(){!document.mozFullScreen&&n._eeState.fullscreen&&n._exitFullscreen(T)},!1):x&&document.addEventListener("fullscreenchange",function(){document.fullscreenElement==null&&n._eeState.fullscreen&&n._exitFullscreen(T)},!1),h=n.iframe.getElementById("epiceditor-utilbar"),n.settings.button.bar!==!0&&(h.style.display="none"),h.addEventListener("mouseover",function(){p&&clearTimeout(p)}),k=[n.previewerIframeDocument,n.editorIframeDocument];for(L=0;L<k.length;L++)k[L].addEventListener("mousemove",function(e){O(e)}),k[L].addEventListener("scroll",function(e){O(e)}),k[L].addEventListener("keyup",function(e){_(e)}),k[L].addEventListener("keydown",function(e){M(e)}),k[L].addEventListener("paste",function(e){D(e)});return n.settings.file.autoSave&&(n._saveIntervalTimer=e.setInterval(function(){if(!n._canSave)return;n.save(!1,!0)},n.settings.file.autoSave)),n.settings.textarea&&n._setupTextareaSync(),e.addEventListener("resize",function(){n.is("fullscreen")?(r(n.iframeElement,{width:e.outerWidth+"px",height:e.innerHeight+"px"}),r(n.element,{height:e.innerHeight+"px"}),r(n.previewerIframe,{width:e.outerWidth/2+"px",height:e.innerHeight+"px"}),r(n.editorIframe,{width:e.outerWidth/2+"px",height:e.innerHeight+"px"})):n.is("fullscreen")||n.reflow()}),n._eeState.loaded=!0,n._eeState.unloaded=!1,n.is("preview")?n.preview():n.edit(),n.iframe.close(),n._eeState.startup=!1,n.settings.autogrow&&(n._fixScrollbars(),A=function(){setTimeout(function(){n._autogrow()},1)},["keydown","keyup","paste","cut"].forEach(function(e){n.getElement("editor").addEventListener(e,A)}),n.on("__update",A),n.on("edit",function(){setTimeout(A,50)}),n.on("preview",function(){setTimeout(A,50)}),setTimeout(A,50),A()),t.call(this),this.emit("load"),this},b.prototype._setupTextareaSync=function(){var t=this,n=t.settings.file.name,r;t._textareaSaveTimer=e.setInterval(function(){if(!t._canSave)return;t.save(!0)},100),r=function(){t._textareaElement.value=t.exportFile(n,"text",!0)||t.settings.file.defaultContent},typeof t.settings.textarea=="string"?t._textareaElement=document.getElementById(t.settings.textarea):typeof t.settings.textarea=="object"&&(t._textareaElement=t.settings.textarea),t._textareaElement.value!==""&&(t.importFile(n,t._textareaElement.value),t.save(!0)),r(),t.on("__update",r)},b.prototype._focusExceptOnLoad=function(){var e=this;(e._eeState.startup&&e.settings.focusOnLoad||!e._eeState.startup)&&e.focus()},b.prototype.unload=function(t){if(this.is("unloaded"))throw new Error("Editor isn't loaded");var n=this,r=e.parent.document.getElementById(n._instanceId);return r.parentNode.removeChild(r),n._eeState.loaded=!1,n._eeState.unloaded=!0,t=t||function(){},n.settings.textarea&&(n._textareaElement.value="",n.removeListener("__update")),n._saveIntervalTimer&&e.clearInterval(n._saveIntervalTimer),n._textareaSaveTimer&&e.clearInterval(n._textareaSaveTimer),t.call(this),n.emit("unload"),n},b.prototype.reflow=function(e,t){var n=this,r=o(n.element)-n.element.offsetWidth,i=u(n.element)-n.element.offsetHeight,s=[n.iframeElement,n.editorIframe,n.previewerIframe],a={},f,l;typeof e=="function"&&(t=e,e=null),t||(t=function(){});for(var c=0;c<s.length;c++){if(!e||e=="width")f=n.element.offsetWidth-r+"px",s[c].style.width=f,n._eeState.reflowWidth=f,a.width=f;if(!e||e=="height")l=n.element.offsetHeight-i+"px",s[c].style.height=l,n._eeState.reflowHeight=l,a.height=l}return n.emit("reflow",a),t.call(this,a),n},b.prototype.preview=function(){var e=this,t,n=e.settings.theme.preview,r;return f(e.getElement("wrapper"),"epiceditor-edit-mode","epiceditor-preview-mode"),e.previewerIframeDocument.getElementById("theme")?e.previewerIframeDocument.getElementById("theme").name!==n&&(e.previewerIframeDocument.getElementById("theme").href=n):a(n,e.previewerIframeDocument,"theme"),e.save(!0),e.previewer.innerHTML=e.exportFile(null,"html",!0),e.is("fullscreen")||(e.editorIframe.style.left="-999999px",e.previewerIframe.style.left="",e._eeState.preview=!0,e._eeState.edit=!1,e._focusExceptOnLoad()),e.emit("preview"),e},b.prototype.focus=function(e){var t=this,n=t.is("preview"),r=n?t.previewerIframeDocument.body:t.editorIframeDocument.body;return m()&&n&&(r=t.previewerIframe),r.focus(),this},b.prototype.enterFullscreen=function(){return this.is("fullscreen")?this:(this._goFullscreen(this.iframeElement),this)},b.prototype.exitFullscreen=function(){return this.is("fullscreen")?(this._exitFullscreen(this.iframeElement),this):this},b.prototype.edit=function(){var e=this;return f(e.getElement("wrapper"),"epiceditor-preview-mode","epiceditor-edit-mode"),e._eeState.preview=!1,e._eeState.edit=!0,e.editorIframe.style.left="",e.previewerIframe.style.left="-999999px",e._focusExceptOnLoad(),e.emit("edit"),this},b.prototype.getElement=function(e){var t={container:this.element,wrapper:this.iframe.getElementById("epiceditor-wrapper"),wrapperIframe:this.iframeElement,editor:this.editorIframeDocument,editorIframe:this.editorIframe,previewer:this.previewerIframeDocument,previewerIframe:this.previewerIframe};return!t[e]||this.is("unloaded")?null:t[e]},b.prototype.is=function(e){var t=this;switch(e){case"loaded":return t._eeState.loaded;case"unloaded":return t._eeState.unloaded;case"preview":return t._eeState.preview;case"edit":return t._eeState.edit;case"fullscreen":return t._eeState.fullscreen;default:return!1}},b.prototype.open=function(e){var n=this,r=n.settings.file.defaultContent,i;return e=e||n.settings.file.name,n.settings.file.name=e,this._storage[n.settings.localStorageName]&&(i=n.exportFile(e),i!==t?(h(n.editor,i),n.emit("read")):(h(n.editor,r),n.save(),n.emit("create")),n.previewer.innerHTML=n.exportFile(null,"html"),n.emit("open")),this},b.prototype.save=function(e,n){var r=this,i,s=!1,o=r.settings.file.name,u="",a=this._storage[u+r.settings.localStorageName],f=c(this.editor);e&&(u=r._previewDraftLocation),this._canSave=!0;if(a){i=JSON.parse(this._storage[u+r.settings.localStorageName]);if(i[o]===t)i[o]=r._defaultFileSchema();else if(f!==i[o].content)i[o].modified=new Date,s=!0;else if(n)return;i[o].content=f,this._storage[u+r.settings.localStorageName]=JSON.stringify(i),s&&(r.emit("update"),r.emit("__update")),n?this.emit("autosave"):e||this.emit("save")}return this},b.prototype.remove=function(e){var t=this,n;return e=e||t.settings.file.name,e==t.settings.file.name&&(t._canSave=!1),n=JSON.parse(this._storage[t.settings.localStorageName]),delete n[e],this._storage[t.settings.localStorageName]=JSON.stringify(n),this.emit("remove"),this},b.prototype.rename=function(e,t){var n=this,r=JSON.parse(this._storage[n.settings.localStorageName]);return r[t]=r[e],delete r[e],this._storage[n.settings.localStorageName]=JSON.stringify(r),n.open(t),this},b.prototype.importFile=function(e,n,r,i){var s=this,o=!1;return e=e||s.settings.file.name,n=n||"",r=r||"md",i=i||{},JSON.parse(this._storage[s.settings.localStorageName])[e]===t&&(o=!0),s.settings.file.name=e,h(s.editor,n),o&&s.emit("create"),s.save(),s.is("fullscreen")&&s.preview(),s.settings.autogrow&&setTimeout(function(){s._autogrow()},50),this},b.prototype._getFileStore=function(e,t){var n="",r;return t&&(n=this._previewDraftLocation),r=JSON.parse(this._storage[n+this.settings.localStorageName]),e?r[e]:r},b.prototype.exportFile=function(e,n,r){var i=this,s,o;e=e||i.settings.file.name,n=n||"text",s=i._getFileStore(e,r);if(s===t)return;o=s.content;switch(n){case"html":return o=p(o),i.settings.parser(o);case"text":return p(o);case"json":return s.content=p(s.content),JSON.stringify(s);case"raw":return o;default:return o}},b.prototype.getFiles=function(e,n){var r,i=this._getFileStore(e);if(e)return i!==t&&(n?delete i.content:i.content=p(i.content)),i;for(r in i)i.hasOwnProperty(r)&&(n?delete i[r].content:i[r].content=p(i[r].content));return i},b.prototype.on=function(e,t){var n=this;return this.events[e]||(this.events[e]=[]),this.events[e].push(t),n},b.prototype.emit=function(e,t){function i(e){e.call(n,t)}var n=this,r;t=t||n.getFiles(n.settings.file.name);if(!this.events[e])return;for(r=0;r<n.events[e].length;r++)i(n.events[e][r]);return n},b.prototype.removeListener=function(e,t){var n=this;return t?this.events[e]?(this.events[e].splice(this.events[e].indexOf(t),1),n):n:(this.events[e]=[],n)},b.prototype._autogrow=function(){var t,n,r,i,s,o,a=!1;this.is("fullscreen")||(this.is("edit")?s=this.getElement("editor").documentElement:s=this.getElement("previewer").documentElement,t=u(s),n=t,r=this.settings.autogrow.minHeight,typeof r=="function"&&(r=r(this)),r&&n<r&&(n=r),i=this.settings.autogrow.maxHeight,typeof i=="function"&&(i=i(this)),i&&n>i&&(n=i,a=!0),a?this._fixScrollbars("auto"):this._fixScrollbars("hidden"),n!=this.oldHeight&&(this.getElement("container").style.height=n+"px",this.reflow(),this.settings.autogrow.scroll&&e.scrollBy(0,n-this.oldHeight),this.oldHeight=n))},b.prototype._fixScrollbars=function(e){var t;this.settings.autogrow?t="hidden":t="auto",t=e||t,this.getElement("editor").documentElement.style.overflow=t,this.getElement("previewer").documentElement.style.overflow=t},b.version="0.2.2",b._data={},e.EpicEditor=b})(window),function(){function t(t){this.tokens=[],this.tokens.links={},this.options=t||f.defaults,this.rules=e.normal,this.options.gfm&&(this.options.tables?this.rules=e.tables:this.rules=e.gfm)}function r(e,t){this.options=t||f.defaults,this.links=e,this.rules=n.normal;if(!this.links)throw new Error("Tokens array requires a `links` property.");this.options.gfm?this.options.breaks?this.rules=n.breaks:this.rules=n.gfm:this.options.pedantic&&(this.rules=n.pedantic)}function i(e){this.tokens=[],this.token=null,this.options=e||f.defaults}function s(e,t){return e.replace(t?/&/g:/&(?!#?\w+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function o(e,t){return e=e.source,t=t||"",function n(r,i){return r?(i=i.source||i,i=i.replace(/(^|[^\[])\^/g,"$1"),e=e.replace(r,i),n):new RegExp(e,t)}}function u(){}function a(e){var t=1,n,r;for(;t<arguments.length;t++){n=arguments[t];for(r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}function f(e,n){try{return i.parse(t.lex(e,n),n)}catch(r){r.message+="\nPlease report this to https://github.com/chjj/marked.";if((n||f.defaults).silent)return"An error occured:\n"+r.message;throw r}}var e={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:u,hr:/^( *[-*_]){3,} *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,nptable:u,lheading:/^([^\n]+)\n *(=|-){3,} *\n*/,blockquote:/^( *>[^\n]+(\n[^\n]+)*\n*)+/,list:/^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:/^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,def:/^ *\[([^\]]+)\]: *([^\s]+)(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,table:u,paragraph:/^([^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+\n*/,text:/^[^\n]+/};e.bullet=/(?:[*+-]|\d+\.)/,e.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/,e.item=o(e.item,"gm")(/bull/g,e.bullet)(),e.list=o(e.list)(/bull/g,e.bullet)("hr",/\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)(),e._tag="(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b",e.html=o(e.html)("comment",/<!--[\s\S]*?-->/)("closed",/<(tag)[\s\S]+?<\/\1>/)("closing",/<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g,e._tag)(),e.paragraph=o(e.paragraph)("hr",e.hr)("heading",e.heading)("lheading",e.lheading)("blockquote",e.blockquote)("tag","<"+e._tag)("def",e.def)(),e.normal=a({},e),e.gfm=a({},e.normal,{fences:/^ *(`{3,}|~{3,}) *(\w+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,paragraph:/^/}),e.gfm.paragraph=o(e.paragraph)("(?!","(?!"+e.gfm.fences.source.replace("\\1","\\2")+"|")(),e.tables=a({},e.gfm,{nptable:/^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,table:/^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/}),t.rules=e,t.lex=function(e,n){var r=new t(n);return r.lex(e)},t.prototype.lex=function(e){return e=e.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    ").replace(/\u00a0/g," ").replace(/\u2424/g,"\n"),this.token(e,!0)},t.prototype.token=function(e,t){var e=e.replace(/^ +$/gm,""),n,r,i,s,o,u,a;while(e){if(i=this.rules.newline.exec(e))e=e.substring(i[0].length),i[0].length>1&&this.tokens.push({type:"space"});if(i=this.rules.code.exec(e)){e=e.substring(i[0].length),i=i[0].replace(/^ {4}/gm,""),this.tokens.push({type:"code",text:this.options.pedantic?i:i.replace(/\n+$/,"")});continue}if(i=this.rules.fences.exec(e)){e=e.substring(i[0].length),this.tokens.push({type:"code",lang:i[2],text:i[3]});continue}if(i=this.rules.heading.exec(e)){e=e.substring(i[0].length),this.tokens.push({type:"heading",depth:i[1].length,text:i[2]});continue}if(t&&(i=this.rules.nptable.exec(e))){e=e.substring(i[0].length),s={type:"table",header:i[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:i[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:i[3].replace(/\n$/,"").split("\n")};for(u=0;u<s.align.length;u++)/^ *-+: *$/.test(s.align[u])?s.align[u]="right":/^ *:-+: *$/.test(s.align[u])?s.align[u]="center":/^ *:-+ *$/.test(s.align[u])?s.align[u]="left":s.align[u]=null;for(u=0;u<s.cells.length;u++)s.cells[u]=s.cells[u].split(/ *\| */);this.tokens.push(s);continue}if(i=this.rules.lheading.exec(e)){e=e.substring(i[0].length),this.tokens.push({type:"heading",depth:i[2]==="="?1:2,text:i[1]});continue}if(i=this.rules.hr.exec(e)){e=e.substring(i[0].length),this.tokens.push({type:"hr"});continue}if(i=this.rules.blockquote.exec(e)){e=e.substring(i[0].length),this.tokens.push({type:"blockquote_start"}),i=i[0].replace(/^ *> ?/gm,""),this.token(i,t),this.tokens.push({type:"blockquote_end"});continue}if(i=this.rules.list.exec(e)){e=e.substring(i[0].length),this.tokens.push({type:"list_start",ordered:isFinite(i[2])}),i=i[0].match(this.rules.item),n=!1,a=i.length,u=0;for(;u<a;u++)s=i[u],o=s.length,s=s.replace(/^ *([*+-]|\d+\.) +/,""),~s.indexOf("\n ")&&(o-=s.length,s=this.options.pedantic?s.replace(/^ {1,4}/gm,""):s.replace(new RegExp("^ {1,"+o+"}","gm"),"")),r=n||/\n\n(?!\s*$)/.test(s),u!==a-1&&(n=s[s.length-1]==="\n",r||(r=n)),this.tokens.push({type:r?"loose_item_start":"list_item_start"}),this.token(s,!1),this.tokens.push({type:"list_item_end"});this.tokens.push({type:"list_end"});continue}if(i=this.rules.html.exec(e)){e=e.substring(i[0].length),this.tokens.push({type:this.options.sanitize?"paragraph":"html",pre:i[1]==="pre",text:i[0]});continue}if(t&&(i=this.rules.def.exec(e))){e=e.substring(i[0].length),this.tokens.links[i[1].toLowerCase()]={href:i[2],title:i[3]};continue}if(t&&(i=this.rules.table.exec(e))){e=e.substring(i[0].length),s={type:"table",header:i[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:i[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:i[3].replace(/(?: *\| *)?\n$/,"").split("\n")};for(u=0;u<s.align.length;u++)/^ *-+: *$/.test(s.align[u])?s.align[u]="right":/^ *:-+: *$/.test(s.align[u])?s.align[u]="center":/^ *:-+ *$/.test(s.align[u])?s.align[u]="left":s.align[u]=null;for(u=0;u<s.cells.length;u++)s.cells[u]=s.cells[u].replace(/^ *\| *| *\| *$/g,"").split(/ *\| */);this.tokens.push(s);continue}if(t&&(i=this.rules.paragraph.exec(e))){e=e.substring(i[0].length),this.tokens.push({type:"paragraph",text:i[0]});continue}if(i=this.rules.text.exec(e)){e=e.substring(i[0].length),this.tokens.push({type:"text",text:i[0]});continue}if(e)throw new Error("Infinite loop on byte: "+e.charCodeAt(0))}return this.tokens};var n={escape:/^\\([\\`*{}\[\]()#+\-.!_>|])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,url:u,tag:/^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,link:/^!?\[(inside)\]\(href\)/,reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,em:/^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,code:/^(`+)([\s\S]*?[^`])\1(?!`)/,br:/^ {2,}\n(?!\s*$)/,del:u,text:/^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/};n._inside=/(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/,n._href=/\s*<?([^\s]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/,n.link=o(n.link)("inside",n._inside)("href",n._href)(),n.reflink=o(n.reflink)("inside",n._inside)(),n.normal=a({},n),n.pedantic=a({},n.normal,{strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/}),n.gfm=a({},n.normal,{escape:o(n.escape)("])","~])")(),url:/^(https?:\/\/[^\s]+[^.,:;"')\]\s])/,del:/^~{2,}([\s\S]+?)~{2,}/,text:o(n.text)("]|","~]|")("|","|https?://|")()}),n.breaks=a({},n.gfm,{br:o(n.br)("{2,}","*")(),text:o(n.gfm.text)("{2,}","*")()}),r.rules=n,r.output=function(e,t,n){var i=new r(t,n);return i.output(e)},r.prototype.output=function(e){var t="",n,r,i,o;while(e){if(o=this.rules.escape.exec(e)){e=e.substring(o[0].length),t+=o[1];continue}if(o=this.rules.autolink.exec(e)){e=e.substring(o[0].length),o[2]==="@"?(r=o[1][6]===":"?this.mangle(o[1].substring(7)):this.mangle(o[1]),i=this.mangle("mailto:")+r):(r=s(o[1]),i=r),t+='<a href="'+i+'">'+r+"</a>";continue}if(o=this.rules.url.exec(e)){e=e.substring(o[0].length),r=s(o[1]),i=r,t+='<a href="'+i+'">'+r+"</a>";continue}if(o=this.rules.tag.exec(e)){e=e.substring(o[0].length),t+=this.options.sanitize?s(o[0]):o[0];continue}if(o=this.rules.link.exec(e)){e=e.substring(o[0].length),t+=this.outputLink(o,{href:o[2],title:o[3]});continue}if((o=this.rules.reflink.exec(e))||(o=this.rules.nolink.exec(e))){e=e.substring(o[0].length),n=(o[2]||o[1]).replace(/\s+/g," "),n=this.links[n.toLowerCase()];if(!n||!n.href){t+=o[0][0],e=o[0].substring(1)+e;continue}t+=this.outputLink(o,n);continue}if(o=this.rules.strong.exec(e)){e=e.substring(o[0].length),t+="<strong>"+this.output(o[2]||o[1])+"</strong>";continue}if(o=this.rules.em.exec(e)){e=e.substring(o[0].length),t+="<em>"+this.output(o[2]||o[1])+"</em>";continue}if(o=this.rules.code.exec(e)){e=e.substring(o[0].length),t+="<code>"+s(o[2],!0)+"</code>";continue}if(o=this.rules.br.exec(e)){e=e.substring(o[0].length),t+="<br>";continue}if(o=this.rules.del.exec(e)){e=e.substring(o[0].length),t+="<del>"+this.output(o[1])+"</del>";continue}if(o=this.rules.text.exec(e)){e=e.substring(o[0].length),t+=s(o[0]);continue}if(e)throw new Error("Infinite loop on byte: "+e.charCodeAt(0))}return t},r.prototype.outputLink=function(e,t){return e[0][0]!=="!"?'<a href="'+s(t.href)+'"'+(t.title?' title="'+s(t.title)+'"':"")+">"+this.output(e[1])+"</a>":'<img src="'+s(t.href)+'" alt="'+s(e[1])+'"'+(t.title?' title="'+s(t.title)+'"':"")+">"},r.prototype.mangle=function(e){var t="",n=e.length,r=0,i;for(;r<n;r++)i=e.charCodeAt(r),Math.random()>.5&&(i="x"+i.toString(16)),t+="&#"+i+";";return t},i.parse=function(e,t){var n=new i(t);return n.parse(e)},i.prototype.parse=function(e){this.inline=new r(e.links,this.options),this.tokens=e.reverse();var t="";while(this.next())t+=this.tok();return t},i.prototype.next=function(){return this.token=this.tokens.pop()},i.prototype.peek=function(){return this.tokens[this.tokens.length-1]||0},i.prototype.parseText=function(){var e=this.token.text;while(this.peek().type==="text")e+="\n"+this.next().text;return this.inline.output(e)},i.prototype.tok=function(){switch(this.token.type){case"space":return"";case"hr":return"<hr>\n";case"heading":return"<h"+this.token.depth+">"+this.inline.output(this.token.text)+"</h"+this.token.depth+">\n";case"code":if(this.options.highlight){var e=this.options.highlight(this.token.text,this.token.lang);e!=null&&e!==this.token.text&&(this.token.escaped=!0,this.token.text=e)}return this.token.escaped||(this.token.text=s(this.token.text,!0)),"<pre><code"+(this.token.lang?' class="lang-'+this.token.lang+'"':"")+">"+this.token.text+"</code></pre>\n";case"table":var t="",n,r,i,o,u;t+="<thead>\n<tr>\n";for(r=0;r<this.token.header.length;r++)n=this.inline.output(this.token.header[r]),t+=this.token.align[r]?'<th align="'+this.token.align[r]+'">'+n+"</th>\n":"<th>"+n+"</th>\n";t+="</tr>\n</thead>\n",t+="<tbody>\n";for(r=0;r<this.token.cells.length;r++){i=this.token.cells[r],t+="<tr>\n";for(u=0;u<i.length;u++)o=this.inline.output(i[u]),t+=this.token.align[u]?'<td align="'+this.token.align[u]+'">'+o+"</td>\n":"<td>"+o+"</td>\n";t+="</tr>\n"}return t+="</tbody>\n","<table>\n"+t+"</table>\n";case"blockquote_start":var t="";while(this.next().type!=="blockquote_end"
)t+=this.tok();return"<blockquote>\n"+t+"</blockquote>\n";case"list_start":var a=this.token.ordered?"ol":"ul",t="";while(this.next().type!=="list_end")t+=this.tok();return"<"+a+">\n"+t+"</"+a+">\n";case"list_item_start":var t="";while(this.next().type!=="list_item_end")t+=this.token.type==="text"?this.parseText():this.tok();return"<li>"+t+"</li>\n";case"loose_item_start":var t="";while(this.next().type!=="list_item_end")t+=this.tok();return"<li>"+t+"</li>\n";case"html":return!this.token.pre&&!this.options.pedantic?this.inline.output(this.token.text):this.token.text;case"paragraph":return"<p>"+this.inline.output(this.token.text)+"</p>\n";case"text":return"<p>"+this.parseText()+"</p>\n"}},u.exec=u,f.options=f.setOptions=function(e){return f.defaults=e,f},f.defaults={gfm:!0,tables:!0,breaks:!1,pedantic:!1,sanitize:!1,silent:!1,highlight:null},f.Parser=i,f.parser=i.parse,f.Lexer=t,f.lexer=t.lex,f.InlineLexer=r,f.inlineLexer=r.output,f.parse=f,typeof module!="undefined"?module.exports=f:typeof define=="function"&&define.amd?define(function(){return f}):this.marked=f}.call(function(){return this||(typeof window!="undefined"?window:global)}());;
(function($) {

/**
 * Attach this editor to a target element.
 */
Drupal.wysiwyg.editor.attach.epiceditor = function (context, params, settings) {
  var $target = $('#' + params.field);
  var containerId = params.field + '-epiceditor';
  var defaultContent = $target.val();
  $target.hide().after('<div id="' + containerId + '" class="epiceditor-widget-wrapper" />');

  settings.container = containerId;
  settings.file = {
    defaultContent: defaultContent
  };
  settings.theme = {
    preview: '/themes/preview/github.css',
    editor: '/themes/editor/' + settings.theme + '.css'
  }
  var editor = new EpicEditor(settings).load();
  $target.data('epiceditor', editor);
};

/**
 * Detach a single or all editors.
 */
Drupal.wysiwyg.editor.detach.epiceditor = function (context, params, trigger) {
  var $target = $('#' + params.field);
  var editor = $target.data('epiceditor');

  $target.val(editor.exportFile());

  // Clean-up after itself.
  $target.closest('div.form-item').find('.epiceditor-widget-wrapper').remove();

  if (trigger === 'unload') {
    editor.unload(function () {
      $target.show();
    });
  }
};

})(jQuery);
;
(function ($) {

Drupal.behaviors.textarea = {
  attach: function (context, settings) {
    $('.form-textarea-wrapper.resizable', context).once('textarea', function () {
      var staticOffset = null;
      var textarea = $(this).addClass('resizable-textarea').find('textarea');
      var grippie = $('<div class="grippie"></div>').mousedown(startDrag);

      grippie.insertAfter(textarea);

      function startDrag(e) {
        staticOffset = textarea.height() - e.pageY;
        textarea.css('opacity', 0.25);
        $(document).mousemove(performDrag).mouseup(endDrag);
        return false;
      }

      function performDrag(e) {
        textarea.height(Math.max(32, staticOffset + e.pageY) + 'px');
        return false;
      }

      function endDrag(e) {
        $(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
        textarea.css('opacity', 1);
      }
    });
  }
};

})(jQuery);
;

(function ($) {

/**
 * Auto-hide summary textarea if empty and show hide and unhide links.
 */
Drupal.behaviors.textSummary = {
  attach: function (context, settings) {
    $('.text-summary', context).once('text-summary', function () {
      var $widget = $(this).closest('div.field-type-text-with-summary');
      var $summaries = $widget.find('div.text-summary-wrapper');

      $summaries.once('text-summary-wrapper').each(function(index) {
        var $summary = $(this);
        var $summaryLabel = $summary.find('label');
        var $full = $widget.find('.text-full').eq(index).closest('.form-item');
        var $fullLabel = $full.find('label');

        // Create a placeholder label when the field cardinality is
        // unlimited or greater than 1.
        if ($fullLabel.length == 0) {
          $fullLabel = $('<label></label>').prependTo($full);
        }

        // Setup the edit/hide summary link.
        var $link = $('<span class="field-edit-link">(<a class="link-edit-summary" href="#">' + Drupal.t('Hide summary') + '</a>)</span>').toggle(
          function () {
            $summary.hide();
            $(this).find('a').html(Drupal.t('Edit summary')).end().appendTo($fullLabel);
            return false;
          },
          function () {
            $summary.show();
            $(this).find('a').html(Drupal.t('Hide summary')).end().appendTo($summaryLabel);
            return false;
          }
        ).appendTo($summaryLabel);

        // If no summary is set, hide the summary field.
        if ($(this).find('.text-summary').val() == '') {
          $link.click();
        }
        return;
      });
    });
  }
};

})(jQuery);
;
(function ($) {
  var qMark = '<div class="filter-help"><a></a></div>';
  function changeGuidelines(select) {
    var wrapper = select.closest('.form-item').siblings('.filter-wrapper');
    $('.filter-guidelines-item', wrapper).css('display', 'none');
    $('.filter-guidelines-' + select.val(), wrapper).css('display', 'block');
  }
  // Change the text that is displayed based on the select box.
  function formatChangeHandler() {
    changeGuidelines($(this));
  }
  // Toggle the guidelines text being visible.
  function qMarkClickHandler() {
    $(this).closest('.form-item').siblings('.filter-wrapper').toggleClass('element-invisible');
  }

  Drupal.behaviors.simplifiedFormatsFormatField = {
    attach: function (context, settings) {
      // Once is used with context because otherwise all the question marks are removed on every AJAX call
      $('.text-format-wrapper .filter-list', context).once('simpleFormat')
        .each(function () {
          // Attach change handler to manage showing only the relevant guideline.
          $(this).bind('change', formatChangeHandler);
          changeGuidelines($(this));

          // Append question mark that toggles the display of filter-help.
          $(this).parent().append(qMark);
          $(this).siblings('.filter-help').children().bind('click', qMarkClickHandler);
      });
    }
  };
})(jQuery);
;
(function ($) {

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;
(function ($) {

Drupal.behaviors.menuFieldsetSummaries = {
  attach: function (context) {
    $('fieldset.menu-link-form', context).drupalSetSummary(function (context) {
      if ($('.form-item-menu-enabled input', context).is(':checked')) {
        return Drupal.checkPlain($('.form-item-menu-link-title input', context).val());
      }
      else {
        return Drupal.t('Not in menu');
      }
    });
  }
};

/**
 * Automatically fill in a menu link title, if possible.
 */
Drupal.behaviors.menuLinkAutomaticTitle = {
  attach: function (context) {
    $('fieldset.menu-link-form', context).each(function () {
      // Try to find menu settings widget elements as well as a 'title' field in
      // the form, but play nicely with user permissions and form alterations.
      var $checkbox = $('.form-item-menu-enabled input', this);
      var $link_title = $('.form-item-menu-link-title input', context);
      var $title = $(this).closest('form').find('.form-item-title input');
      // Bail out if we do not have all required fields.
      if (!($checkbox.length && $link_title.length && $title.length)) {
        return;
      }
      // If there is a link title already, mark it as overridden. The user expects
      // that toggling the checkbox twice will take over the node's title.
      if ($checkbox.is(':checked') && $link_title.val().length) {
        $link_title.data('menuLinkAutomaticTitleOveridden', true);
      }
      // Whenever the value is changed manually, disable this behavior.
      $link_title.keyup(function () {
        $link_title.data('menuLinkAutomaticTitleOveridden', true);
      });
      // Global trigger on checkbox (do not fill-in a value when disabled).
      $checkbox.change(function () {
        if ($checkbox.is(':checked')) {
          if (!$link_title.data('menuLinkAutomaticTitleOveridden')) {
            $link_title.val($title.val());
          }
        }
        else {
          $link_title.val('');
          $link_title.removeData('menuLinkAutomaticTitleOveridden');
        }
        $checkbox.closest('fieldset.vertical-tabs-pane').trigger('summaryUpdated');
        $checkbox.trigger('formUpdated');
      });
      // Take over any title change.
      $title.keyup(function () {
        if (!$link_title.data('menuLinkAutomaticTitleOveridden') && $checkbox.is(':checked')) {
          $link_title.val($title.val());
          $link_title.val($title.val()).trigger('formUpdated');
        }
      });
    });
  }
};

})(jQuery);
;

/**
 * @file
 * Attaches behaviors for the Path module.
 */

(function ($) {

Drupal.behaviors.pathFieldsetSummaries = {
  attach: function (context) {
    $('fieldset.path-form', context).drupalSetSummary(function (context) {
      var path = $('.form-item-path-alias input').val();

      return path ?
        Drupal.t('Alias: @alias', { '@alias': path }) :
        Drupal.t('No alias');
    });
  }
};

})(jQuery);
;

(function ($) {

Drupal.behaviors.metatagFieldsetSummaries = {
  attach: function (context) {
    $('fieldset.metatags-form', context).drupalSetSummary(function (context) {
      var vals = [];
      $("input[type='text'], select, textarea", context).each(function() {
        var input_field = $(this).attr('name');
        // Verify the field exists before proceeding.
        if (input_field === undefined) {
          return false;
        }
        var default_name = input_field.replace(/\[value\]/, '[default]');
        var default_value = $("input[type='hidden'][name='" + default_name + "']", context);
        if (default_value.length && default_value.val() == $(this).val()) {
          // Meta tag has a default value and form value matches default value.
          return true;
        }
        else if (!default_value.length && !$(this).val().length) {
          // Meta tag has no default value and form value is empty.
          return true;
        }
        var label = $("label[for='" + $(this).attr('id') + "']").text();
        vals.push(Drupal.t('@label: @value', {
          '@label': $.trim(label),
          '@value': Drupal.truncate($(this).val(), 25) || Drupal.t('None')
        }));
      });
      if (vals.length === 0) {
        return Drupal.t('Using defaults');
      }
      else {
        return vals.join('<br />');
      }
    });
  }
};

/**
 * Encode special characters in a plain-text string for display as HTML.
 */
Drupal.truncate = function (str, limit) {
  if (str.length > limit) {
    return str.substr(0, limit) + '...';
  }
  else {
    return str;
  }
};

})(jQuery);
;
(function ($) {

/**
 * Attaches the autocomplete behavior to all required fields.
 */
Drupal.behaviors.autocomplete = {
  attach: function (context, settings) {
    var acdb = [];
    $('input.autocomplete', context).once('autocomplete', function () {
      var uri = this.value;
      if (!acdb[uri]) {
        acdb[uri] = new Drupal.ACDB(uri);
      }
      var $input = $('#' + this.id.substr(0, this.id.length - 13))
        .attr('autocomplete', 'OFF')
        .attr('aria-autocomplete', 'list');
      $($input[0].form).submit(Drupal.autocompleteSubmit);
      $input.parent()
        .attr('role', 'application')
        .append($('<span class="element-invisible" aria-live="assertive"></span>')
          .attr('id', $input.attr('id') + '-autocomplete-aria-live')
        );
      new Drupal.jsAC($input, acdb[uri]);
    });
  }
};

/**
 * Prevents the form from submitting if the suggestions popup is open
 * and closes the suggestions popup when doing so.
 */
Drupal.autocompleteSubmit = function () {
  return $('#autocomplete').each(function () {
    this.owner.hidePopup();
  }).length == 0;
};

/**
 * An AutoComplete object.
 */
Drupal.jsAC = function ($input, db) {
  var ac = this;
  this.input = $input[0];
  this.ariaLive = $('#' + this.input.id + '-autocomplete-aria-live');
  this.db = db;

  $input
    .keydown(function (event) { return ac.onkeydown(this, event); })
    .keyup(function (event) { ac.onkeyup(this, event); })
    .blur(function () { ac.hidePopup(); ac.db.cancel(); });

};

/**
 * Handler for the "keydown" event.
 */
Drupal.jsAC.prototype.onkeydown = function (input, e) {
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
    case 40: // down arrow.
      this.selectDown();
      return false;
    case 38: // up arrow.
      this.selectUp();
      return false;
    default: // All other keys.
      return true;
  }
};

/**
 * Handler for the "keyup" event.
 */
Drupal.jsAC.prototype.onkeyup = function (input, e) {
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
    case 16: // Shift.
    case 17: // Ctrl.
    case 18: // Alt.
    case 20: // Caps lock.
    case 33: // Page up.
    case 34: // Page down.
    case 35: // End.
    case 36: // Home.
    case 37: // Left arrow.
    case 38: // Up arrow.
    case 39: // Right arrow.
    case 40: // Down arrow.
      return true;

    case 9:  // Tab.
    case 13: // Enter.
    case 27: // Esc.
      this.hidePopup(e.keyCode);
      return true;

    default: // All other keys.
      if (input.value.length > 0 && !input.readOnly) {
        this.populatePopup();
      }
      else {
        this.hidePopup(e.keyCode);
      }
      return true;
  }
};

/**
 * Puts the currently highlighted suggestion into the autocomplete field.
 */
Drupal.jsAC.prototype.select = function (node) {
  this.input.value = $(node).data('autocompleteValue');
};

/**
 * Highlights the next suggestion.
 */
Drupal.jsAC.prototype.selectDown = function () {
  if (this.selected && this.selected.nextSibling) {
    this.highlight(this.selected.nextSibling);
  }
  else if (this.popup) {
    var lis = $('li', this.popup);
    if (lis.length > 0) {
      this.highlight(lis.get(0));
    }
  }
};

/**
 * Highlights the previous suggestion.
 */
Drupal.jsAC.prototype.selectUp = function () {
  if (this.selected && this.selected.previousSibling) {
    this.highlight(this.selected.previousSibling);
  }
};

/**
 * Highlights a suggestion.
 */
Drupal.jsAC.prototype.highlight = function (node) {
  if (this.selected) {
    $(this.selected).removeClass('selected');
  }
  $(node).addClass('selected');
  this.selected = node;
  $(this.ariaLive).html($(this.selected).html());
};

/**
 * Unhighlights a suggestion.
 */
Drupal.jsAC.prototype.unhighlight = function (node) {
  $(node).removeClass('selected');
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Hides the autocomplete suggestions.
 */
Drupal.jsAC.prototype.hidePopup = function (keycode) {
  // Select item if the right key or mousebutton was pressed.
  if (this.selected && ((keycode && keycode != 46 && keycode != 8 && keycode != 27) || !keycode)) {
    this.input.value = $(this.selected).data('autocompleteValue');
  }
  // Hide popup.
  var popup = this.popup;
  if (popup) {
    this.popup = null;
    $(popup).fadeOut('fast', function () { $(popup).remove(); });
  }
  this.selected = false;
  $(this.ariaLive).empty();
};

/**
 * Positions the suggestions popup and starts a search.
 */
Drupal.jsAC.prototype.populatePopup = function () {
  var $input = $(this.input);
  var position = $input.position();
  // Show popup.
  if (this.popup) {
    $(this.popup).remove();
  }
  this.selected = false;
  this.popup = $('<div id="autocomplete"></div>')[0];
  this.popup.owner = this;
  $(this.popup).css({
    top: parseInt(position.top + this.input.offsetHeight, 10) + 'px',
    left: parseInt(position.left, 10) + 'px',
    width: $input.innerWidth() + 'px',
    display: 'none'
  });
  $input.before(this.popup);

  // Do search.
  this.db.owner = this;
  this.db.search(this.input.value);
};

/**
 * Fills the suggestion popup with any matches received.
 */
Drupal.jsAC.prototype.found = function (matches) {
  // If no value in the textfield, do not show the popup.
  if (!this.input.value.length) {
    return false;
  }

  // Prepare matches.
  var ul = $('<ul></ul>');
  var ac = this;
  for (key in matches) {
    $('<li></li>')
      .html($('<div></div>').html(matches[key]))
      .mousedown(function () { ac.select(this); })
      .mouseover(function () { ac.highlight(this); })
      .mouseout(function () { ac.unhighlight(this); })
      .data('autocompleteValue', key)
      .appendTo(ul);
  }

  // Show popup with matches, if any.
  if (this.popup) {
    if (ul.children().length) {
      $(this.popup).empty().append(ul).show();
      $(this.ariaLive).html(Drupal.t('Autocomplete popup'));
    }
    else {
      $(this.popup).css({ visibility: 'hidden' });
      this.hidePopup();
    }
  }
};

Drupal.jsAC.prototype.setStatus = function (status) {
  switch (status) {
    case 'begin':
      $(this.input).addClass('throbbing');
      $(this.ariaLive).html(Drupal.t('Searching for matches...'));
      break;
    case 'cancel':
    case 'error':
    case 'found':
      $(this.input).removeClass('throbbing');
      break;
  }
};

/**
 * An AutoComplete DataBase object.
 */
Drupal.ACDB = function (uri) {
  this.uri = uri;
  this.delay = 300;
  this.cache = {};
};

/**
 * Performs a cached and delayed search.
 */
Drupal.ACDB.prototype.search = function (searchString) {
  var db = this;
  this.searchString = searchString;

  // See if this string needs to be searched for anyway.
  searchString = searchString.replace(/^\s+|\s+$/, '');
  if (searchString.length <= 0 ||
    searchString.charAt(searchString.length - 1) == ',') {
    return;
  }

  // See if this key has been searched for before.
  if (this.cache[searchString]) {
    return this.owner.found(this.cache[searchString]);
  }

  // Initiate delayed search.
  if (this.timer) {
    clearTimeout(this.timer);
  }
  this.timer = setTimeout(function () {
    db.owner.setStatus('begin');

    // Ajax GET request for autocompletion. We use Drupal.encodePath instead of
    // encodeURIComponent to allow autocomplete search terms to contain slashes.
    $.ajax({
      type: 'GET',
      url: db.uri + '/' + Drupal.encodePath(searchString),
      dataType: 'json',
      success: function (matches) {
        if (typeof matches.status == 'undefined' || matches.status != 0) {
          db.cache[searchString] = matches;
          // Verify if these are still the matches the user wants to see.
          if (db.searchString == searchString) {
            db.owner.found(matches);
          }
          db.owner.setStatus('found');
        }
      },
      error: function (xmlhttp) {
        alert(Drupal.ajaxError(xmlhttp, db.uri));
      }
    });
  }, this.delay);
};

/**
 * Cancels the current autocomplete request.
 */
Drupal.ACDB.prototype.cancel = function () {
  if (this.owner) this.owner.setStatus('cancel');
  if (this.timer) clearTimeout(this.timer);
  this.searchString = '';
};

})(jQuery);
;

(function ($) {

Drupal.behaviors.nodeFieldsetSummaries = {
  attach: function (context) {
    $('fieldset.node-form-revision-information', context).drupalSetSummary(function (context) {
      var revisionCheckbox = $('.form-item-revision input', context);

      // Return 'New revision' if the 'Create new revision' checkbox is checked,
      // or if the checkbox doesn't exist, but the revision log does. For users
      // without the "Administer content" permission the checkbox won't appear,
      // but the revision log will if the content type is set to auto-revision.
      if (revisionCheckbox.is(':checked') || (!revisionCheckbox.length && $('.form-item-log textarea', context).length)) {
        return Drupal.t('New revision');
      }

      return Drupal.t('No revision');
    });

    $('fieldset.node-form-author', context).drupalSetSummary(function (context) {
      var name = $('.form-item-name input', context).val() || Drupal.settings.anonymous,
        date = $('.form-item-date input', context).val();
      return date ?
        Drupal.t('By @name on @date', { '@name': name, '@date': date }) :
        Drupal.t('By @name', { '@name': name });
    });

    $('fieldset.node-form-options', context).drupalSetSummary(function (context) {
      var vals = [];

      $('input:checked', context).parent().each(function () {
        vals.push(Drupal.checkPlain($.trim($(this).text())));
      });

      if (!$('.form-item-status input', context).is(':checked')) {
        vals.unshift(Drupal.t('Not published'));
      }
      return vals.join(', ');
    });
  }
};

})(jQuery);
;
