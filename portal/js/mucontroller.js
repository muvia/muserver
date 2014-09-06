/**
 MuController: accesible html5 input controller
 Copyright (C) 2014 mundopato inc

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published
 by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 contact: http://www.mundopato.com
 */
var MuController = (function(){
	'use strict';

  var MuController = {};

    //--- private module methods ---

    /**
     *
     * @param id
     * @param visible
     * @param classname
     * @param content (optional)
     * @returns {*}
     * @private
     */
    MuController._createDiv = function(id, visible, classname, content){
        var div = document.createElement("div");
        div.id = id;
        if(classname){
            div.className = classname;
        }
        MuController._setContent(div, content);
        MuController._showDiv(div, visible);
        return div;
    };

    /**
     * @private
     * @description set the content of a div
     * @param div
     * @param text
     * @private
     */
    MuController._setContent = function(div, content){
        if(!content) return;
        if(div.innerHTML || div.innerHTML === ''){
            div.innerHTML = content;
        }else if(div.innerText || div.innerText === ''){
            div.innerText = content;
        }else
        {
            console.log(div);
        }
    };

    /**
     *
     * @param div
     * @param visible
     * @private
     */
    MuController._showDiv = function(div, visible){
        var style = window.getComputedStyle(div);
        var display = style.getPropertyValue('display');
        if(display === '' || display=='none') display = 'block';
        div.setAttribute("style", "display:"+(visible?display:"none"));
    };


    //http://blog.adtile.me/2014/01/16/a-dive-into-plain-javascript/
    MuController.removeClass = function(el, cls) {
        var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
        el.className = el.className.replace(reg, " ").replace(/(^\s*)|(\s*$)/g,"");
    };

    //http://blog.adtile.me/2014/01/16/a-dive-into-plain-javascript/
    MuController.hasClass = function(el, cls) {
        if(!el){
            throw "undefined element";
        }
        return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
    };

    MuController.addClass = function(el, cls){
        el.className += " "+cls;
    };

    return MuController;
})();
/**
* MuController.Menu
*/
(function(MuController){
  'use strict';

  //------------ main Menu class --------------
    /**
     * constructor
     * @param divid the div element that contains the menubar
     */
    MuController.Menu = function(divid, entryCallback, menuCallback){
        this.menudiv = document.getElementById(divid);

        this.rootMenuBar = null;

        this.menuBarContainer = null;

        this.alert = this.menudiv.querySelector("div#alert");

        var self = this;

        //status variables
        this.context = {
            triggerOnSelect: false,
            confirmBeforeTrigger: false,
            currmenubar: this.rootMenuBar,
            currentry: null,
            notify: function(msg){
                MuController._setContent(self.alert, msg);
            },
            triggerEntryCallback: entryCallback || function(entryid){},
            triggerMenuCallback: menuCallback || function(menuid){}
        };


        var _keydownCallback = function(ev){
                self.onKeyDown(ev);
        };

        this.build();

        this.menudiv.addEventListener("click", function(ev){
            self.onClick(ev.srcElement? ev.srcElement: ev.target);
            return false;
        });

        this.menudiv.addEventListener('keydown', _keydownCallback, true);

    };

    /**
     * iterate over the nested collection of ul and li, to build a model of them, while flatting the dom
     */
    MuController.Menu.prototype.build = function(){
        //this is the level 1
        var menu = this.menudiv.querySelector("menu");
        this.menudiv.removeChild(menu);
        this.menuBarContainer = MuController._createDiv("menuBarContainer", true, 'menubarcontainer');
        this.menuBarContainer.tabindex="-1";
        this.menudiv.appendChild(this.menuBarContainer);
        this.rootMenuBar =new MuController.MenuBar(menu, null, this);
    };

    /**
     * key down handler
     */
    MuController.Menu.prototype.onKeyDown = function(event){
        var key = event.keyCode;
        if(key === 38 || key === 40){ //up or down

          if(!this.context.currmenubar){
                	this.rootMenuBar.execute(this.context);
          }else{
            if(!this.context.currentry){
              this.context.currmenubar.getFirstEntry().execute(this.context);
            }else{
              if(key === 38){
                var sibling = this.context.currentry.parent.getPrevSibling(this.context.currentry, true);
              }else if(key === 40){
                var sibling = this.context.currentry.parent.getNextSibling(this.context.currentry, true);
              }
              if(sibling){
                sibling.execute(this.context);
              }
            }
          }
        }else if(key === 37){ //left
          if(this.context.currentry){
            //move focus to the container toolbar
              //this.context.currentry.parent
              this.context.currentry.unselect();
              this.context.currentry = null;
          }else if(this.context.currmenubar){
            //move focus to parent currmenubar, if available
            var bar = this.context.currmenubar;
            if(bar.parent){
                bar.unselect(this.context); //this nulls context.currmenubar
                bar.parent.select(this.context); //this set context.currmenubar
                bar.hide();
            }
          }

        }else if(key === 13 || key === 39){//enter or right

            if(this.context.currentry){
                this.context.currentry.execute(this.context);
            } else{
                if(!this.context.currmenubar){
                	this.rootMenuBar.execute(this.context);
                }else{
	                this.context.currmenubar.execute(this.context);
                }
            }

        }else{
            //console.log(event.keyCode);
        }

    };

    /**
     * handles on click events. receives the source DOM element
     */
    MuController.Menu.prototype.onClick = function(srcElement){

        if(!srcElement){
            console.log("undefined srcElement", srcElement);
        }

        //@todo: check that we have keyboard focus
        this.menudiv.getElementsByTagName("button")[0].focus();

        if(MuController.hasClass(srcElement, 'menutitle')){
            //the button titles block the click on the divs.. so move to the parent
            srcElement = srcElement.parentNode?srcElement.parentNode:srcElement.parentElement;
        }

        if(MuController.hasClass(srcElement, 'menucontainer')){

        }else if(MuController.hasClass(srcElement, 'menubar')){
            var menubar = this.rootMenuBar.findMenuBar(srcElement.id);
            if(menubar) menubar.execute(this.context);
        }else if(MuController.hasClass(srcElement, 'menuentry') || MuController.hasClass(srcElement, 'entry')){
            var entry = this.rootMenuBar.findEntry(srcElement.id);
            if(entry) entry.execute(this.context);
        }
    };


})(MuController);
/**
* MuController.MenuBar
*/
(function(MuController){
  'use strict';

    //----- menu bar class ------------
    MuController.MenuBar = function(menuElement, parentMenuBar, mainMenu){
        this.parent = parentMenuBar;
        this.title = null;
        this.submenus= [];
        this.activesubmenu = null;
        this.entries = [];
        var tagname = menuElement.tagName.toLowerCase();
        this.id = menuElement.id;
        this.title = (menuElement.title ? menuElement.title : menuElement.getAttribute("title"));

        //this is the main div for this menuBar. all hidden except the first level
        this.el = MuController._createDiv(this.id, parentMenuBar === null, 'menubar');

        //create a title div for the menubar
        var titlediv = MuController._createDiv((this.id + '_title'), true, 'menutitle', this.title);
        this.el.appendChild(titlediv);

        //but we also must add an entry to the parent menuBar
        if(this.parent != null){
            this.parent.entries.push(new MuController.MenuEntry(this.el, this.parent, this));
        }

        mainMenu.menuBarContainer.appendChild(this.el);

        if(tagname === 'menu'){
            //iterate over children, look for entries and sub-menus
            for(var i=0; i< menuElement.children.length; ++i){
                var child = menuElement.children[i];
                if(child.tagName.toLowerCase() === 'menu'){
                    this.submenus.push(new MuController.MenuBar(child, this, mainMenu));
                }else if(child.tagName.toLowerCase() === 'entry'){
                    this.entries.push(new MuController.MenuEntry(child, this));
                }
            }
        }
    };

  /**
  * just return the first entry
  */
  MuController.MenuBar.prototype.getFirstEntry = function(){
    return this.entries[0];
  };


 /**
  * returns the prev sibling of the given entry.
  * if cycle is false, returns null if this is the first entry.
  * if cycle is true, returns the last entry.
  */
  MuController.MenuBar.prototype.getPrevSibling = function(entry, cycle){
    if(!entry) return null;
    var index = -1;
    for(var i=0; i<this.entries.length;++i){
      if(this.entries[i] === entry){
        index = i;
        break;
      }
    }
    if(index < 0) return null;
    index--;
    if(index > -1){
      return this.entries[index];
    }else{
      return cycle?this.entries[this.entries.length-1]:null;
    }
  };

 /**
  * returns the next sibling of the given entry.
  * if cycle is false, returns null if this is the last entry.
  * if cycle is true, returns the first entry.
  */
  MuController.MenuBar.prototype.getNextSibling = function(entry, cycle){
    if(!entry) return null;
    var index = -1;
    for(var i=0; i<this.entries.length;++i){
      if(this.entries[i] === entry){
        index = i;
        break;
      }
    }
    if(index < 0) return null;
    index++;
    if(index < this.entries.length){
      return this.entries[index];
    }else{
      return cycle?this.entries[0]:null;
    }
  };

    /**
     * main entry point for perform things. based on context status it will decide
     * wich specific action (select, trigger) will be executed, and what other objects
     * must be notified.
     */
    MuController.MenuBar.prototype.execute = function(context){
        if(context.currmenubar != this){
            //a selection. unselect previous?
            if(context.currmenubar != null){
                context.currmenubar.unselect(context);
            }
            this.select(context);
        }else{
            //a execution.
            this.trigger(context);
        }
    };

    /**
     * triggering a menubar implies to make it visible and put the focus on it.
     */
    MuController.MenuBar.prototype.trigger = function(context){

        if(context.currmenubar === this){
        	/*maybe a keyboard event and the menubar is already displayed..
        	* lets assure that the first menuitem is executed.
        	*/
        	if(this.entries[0]){
        		this.entries[0].execute(context);
        	}
        	return;
        }

        if(context.currmenubar !== null){
            //only hide if is not my ancestor
            if(context.currmenubar != this.parent){
                context.currmenubar.hide();
            }

            context.currmenubar.unselect(context);

        }
      this.select(context);
    };

    /**
     *
     MenuBar.prototype.isAncestor = function(menubar){
           var mb = this.parent;
           do while(this.parent != menubar && this.parent != null){

           }
        };
     */


    /**
     * change stylus?
     */
    MuController.MenuBar.prototype.unselect = function(context){
        context.currmenubar = null;
        MuController.removeClass(this.el, 'selected');
    };

    /**
     *
     */
    MuController.MenuBar.prototype.select = function(context){
    	context.currmenubar = this;
		MuController.addClass(this.el, 'selected');
        MuController._showDiv(this.el, true);
        context.notify("selected menu "+ this.title);
    };


    /**
     *
     */
    MuController.MenuBar.prototype.hide = function(context){
        if(this.activesubmenu != null){
            this.activesubmenu.hide();
            this.activesubmenu = null;
        }
        MuController._showDiv(this.el, false);

    };

    /**
     * retrieves and entry by id over the whole menubar tree
     */
    MuController.MenuBar.prototype.findEntry = function(id){
        for(var i=0; i<this.entries.length; ++i){
            if(this.entries[i].id === id)
                return this.entries[i];
        }
        for(var j=0; j<this.submenus.length; ++j){
            var entry = this.submenus[j].findEntry(id);
            if(entry != null)
                return entry;
        }
        return null;
    };

    /**
     * retrieves a submenu (menubar) children of this container
     * @param id
     */
    MuController.MenuBar.prototype.findMenuBar = function(id){
        for(var j=0; j<this.submenus.length; ++j){
            var menu = this.submenus[j];
            if(menu.id === id)
                return menu;
        }
        return null;
    };


})(MuController);
/**
* MuController.MenuEntry class
*/
(function(MuController){
  'use strict';

  //------- menu entry class ----------

  /**
   * if target = Menubar, this is an entry that controls a submenu.
  */
  MuController.MenuEntry = function(entryElement, menuBarParent, target){
    this.parent = menuBarParent;
    this.id = entryElement.id;
    this.title = entryElement.innerHTML? entryElement.innerHTML : (entryElement.innerText ? entryElement.innerText : "error");
    this.target = target;
    var classname = 'entry';
    if(target !== undefined && target instanceof MuController.MenuBar){
      classname = 'menuentry';
      }

      this.el = MuController._createDiv(this.id, true, classname, this.title);
      menuBarParent.el.appendChild(this.el);
  };


    /**
     * main entry point for perform things. based on context status it will decide
     * wich specific action (select, trigger) will be executed, and what other objects
     * must be notified.
     */
    MuController.MenuEntry.prototype.execute = function(context){
        if(context.currentry != this){
            //a selection. unselect previous?
            if(context.currentry != null){
                context.currentry.unselect(context);
            }
            this.select(context);
        }else{
            //a execution.
            this.trigger(context);
        }
    };

    /**
     * unselect must hide its target, but only if the new selected menu
     */
    MuController.MenuEntry.prototype.unselect = function(context){
        MuController.removeClass(this.el, 'selected');
    };

    /**
     *
     */
    MuController.MenuEntry.prototype.select = function(context){
        context.currentry = this;
        MuController.addClass(this.el, 'selected');
        context.notify("selected option "+ this.title);
    };

    /**
     *
     */
    MuController.MenuEntry.prototype.trigger = function(context){
        if(this.target){
          //we control a submenu! lets make it visible!
          if(this.parent.activesubmenu != null){
            this.parent.activesubmenu.hide();
          }
          //unselect this menuentry and select the associated menu
          this.unselect();
          context.currentry = null;
          this.parent.activesubmenu = this.target;
          this.target.trigger(context);
        }else{
          context.notify("executing option "+ this.title);
          context.triggerEntryCallback(this.id);
        }
    };



  })(MuController);
