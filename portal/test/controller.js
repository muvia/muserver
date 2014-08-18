'use strict';

/**
 *
 */
var AccesibleMenu = (function(){

    //----- menu bar class ------------
    var MenuBar = function(menuElement, parentMenuBar, mainMenu){
        this.parent = parentMenuBar;
        this.title = null;
        this.submenus= [];
        this.activesubmenu = null;
        this.entries = [];
        var tagname = menuElement.tagName.toLowerCase();
        this.id = menuElement.id;
        this.title = (menuElement.title ? menuElement.title : menuElement.getAttribute("title"));

        //this is the main div for this menuBar. all hidden except the first level
        this.el = _createDiv(this.id, parentMenuBar === null, 'menubar');

        //create a title div for the menubar
        var titlediv = _createDiv((this.id + '_title'), true, 'menutitle', this.title);
        this.el.appendChild(titlediv);

        //but we also must add a entry to the parent menuBar
        if(this.parent != null){
            this.entries.push(new MenuEntry(this.el, this.parent, this));
            //this.parent.addMenuEntry(this);
        }

        mainMenu.menuBarContainer.appendChild(this.el);

        if(tagname === 'menu'){
            //iterate over children, look for entries and sub-menus
            for(var i=0; i< menuElement.children.length; ++i){
                var child = menuElement.children[i];
                if(child.tagName.toLowerCase() === 'menu'){
                    this.submenus.push(new MenuBar(child, this, mainMenu));
                }else if(child.tagName.toLowerCase() === 'entry'){
                    this.entries.push(new MenuEntry(child, this));
                }
            }
        }
    };

    /**
     * main entry point for perform things. based on context status it will decide
     * wich specific action (select, trigger) will be executed, and what other objects
     * must be notified.
     */
    MenuBar.prototype.execute = function(context){
        if(context.currmenubar != this){
            //a selection. unselect previous?
            if(context.currmenubar != null){
                context.currmenubar.unselect(context);
            }
            context.currmenubar = this;
            this.select();
        }else{
            //a execution.
            this.trigger(context);
        }
    };

    /**
     * triggering a menubar implies to make it visible and put the focus on it.
     */
    MenuBar.prototype.trigger = function(context){
        console.log("triggering menubar "+ this.id);
        if(context.currmenubar !== null){
            //only hide if is not my ancestor
            if(context.currmenubar != this.parent){
                context.currmenubar.hide();
            }

            context.currmenubar.unselect(context);

        }
        context.currmenubar = this;
        _showDiv(this.el, true);
    }

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
    MenuBar.prototype.unselect = function(context){
        console.log("unselecting MenuBar "+ this.id);
        context.currmenubar = null;
    }

    /**
     *
     */
    MenuBar.prototype.hide = function(context){
        if(this.activesubmenu != null){
            this.activesubmenu.hide();
            this.activesubmenu = null;
        }
        _showDiv(this.el, false);

    }

    /**
     * retrieves and entry by id over the whole menubar tree
     */
    MenuBar.prototype.findEntry = function(id){
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
    }

    /**
     * retrieves a submenu (menubar) children of this container
     * @param id
     */
    MenuBar.prototype.findMenuBar = function(id){
        for(var j=0; j<this.submenus.length; ++j){
            var menu = this.submenus[j];
            if(menu.id === id)
                return menu;
        }
        return null;
    }


    //------- menu entry class ----------

    /**
     * if target = Menubar, this is an entry that controls a submenu.
     */
    var MenuEntry = function(entryElement, menuBarParent, target){
        this.parent = menuBarParent;
        this.id = entryElement.id;
        this.title = entryElement.innerHTML? entryElement.innerHTML : (entryElement.innerText ? entryElement.innerText : "error");
        this.target = target;
        var classname = 'entry';
        if(target !== undefined && target instanceof MenuBar){
            classname = 'menuentry';
        }
        this.el = _createDiv(this.id, true, classname, this.title);
        menuBarParent.el.appendChild(this.el);
    };


    /**
     * main entry point for perform things. based on context status it will decide
     * wich specific action (select, trigger) will be executed, and what other objects
     * must be notified.
     */
    MenuEntry.prototype.execute = function(context){
        if(context.currentry != this){
            //a selection. unselect previous?
            if(context.currentry != null){
                context.currentry.unselect(context);
            }
            context.currentry = this;
            this.select();
        }else{
            //a execution.
            this.trigger(context);
        }
    };

    /**
     * unselect must hide its target, but only if the new selected menu
     */
    MenuEntry.prototype.unselect = function(context){
        console.log("MenuEntry.unselect #", this.id);
        if(this.target){
            //this.target.hide();
        }
        removeClass(this.el, 'selected');
    };

    /**
     *
     */
    MenuEntry.prototype.select = function(){
        console.log("MenuEntry.select #", this.id);
        addClass(this.el, 'selected');
    };

    /**
     *
     */
    MenuEntry.prototype.trigger = function(context){
        console.log("MenuEntry.trigger #", this.id);
        if(this.target){
            //we control a submenu! lets make it visible!
            if(this.parent.activesubmenu != null){
                this.parent.activesubmenu.hide();
            }
            this.parent.activesubmenu = this.target;
            this.target.trigger(context);

        }
    };


    //------------ main Menu class --------------
    /**
     * constructor
     * @param divid the div element that contains the menubar
     * @param buttonid the id of the button used to activate the menubar
     */
    var Menu = function(divid, buttonid){
        this.menudiv = document.getElementById(divid);

        this.rootMenuBar = null;

        this.menuBarContainer = null;

        //status variables
        this.context = {
            triggerOnSelect: false,
            confirmBeforeTrigger: false,
            currmenubar: this.rootMenuBar,
            currentry: null
        };



        var self = this;


        var _keydownCallback = function(ev){
                self.onKeyDown(ev);
        }

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
    Menu.prototype.build = function(){
        //this is the level 1
        var menu = this.menudiv.querySelector("menu");
        this.menudiv.removeChild(menu);
        this.menuBarContainer = _createDiv("menuBarContainer", true, 'menubarcontainer');
        this.menuBarContainer.tabindex="-1";
        this.menudiv.appendChild(this.menuBarContainer);
        this.rootMenuBar =new MenuBar(menu, null, this);
    };

    /**
     * key down handler
     */
    Menu.prototype.onKeyDown = function(event){
        var key = event.keyCode;
        if(key === 38){ //up
            console.log("up");
        }else if(key === 40){//down
            console.log("down");

            if(this.context.currentry){
                this.context.currentry.execute(this.context);
            } else{
                if(!this.context.currmenubar){
                    this.context.currmenubar = this.rootMenuBar;
                }
                this.context.currmenubar.execute(this.context);
            }

        }else if(key === 39){ //left
            console.log("left");
        }else if(key === 37){//right
            console.log("right");
        }else if(key === 13){//enter

            if(this.context.currentry){
                this.context.currentry.execute(this.context);
            } else{
                if(!this.context.currmenubar){
                    this.context.currmenubar = this.rootMenuBar;
                }
                this.context.currmenubar.execute(this.context);
            }

        }else{
            console.log(event.keyCode);
        }

    };

    /**
     * handles on click events. receives the source DOM element
     */
    Menu.prototype.onClick = function(srcElement){

        if(!srcElement){
            console.log("undefined srcElement", srcElement);
        }

        if(hasClass(srcElement, 'menutitle')){
            //the button titles block the click on the divs.. so move to the parent
            srcElement = srcElement.parentNode?srcElement.parentNode:srcElement.parentElement;
        }

        if(hasClass(srcElement, 'menucontainer')){

        }else if(hasClass(srcElement, 'menubar')){
            var menubar = this.rootMenuBar.findMenuBar(srcElement.id);
            if(menubar) menubar.execute(this.context);
        }else if(hasClass(srcElement, 'menuentry') || hasClass(srcElement, 'entry')){
            var entry = this.rootMenuBar.findEntry(srcElement.id);
            if(entry) entry.execute(this.context);
        }
    };

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
    function _createDiv(id, visible, classname, content){
        var div = document.createElement("div");
        div.id = id;
        if(classname){
            div.className = classname;
        }
        if(content){
            if(div.innerHTML || div.innerHTML === ''){
                div.innerHTML = content;
            }else if(div.innerText || div.innerText === ''){
                div.innerText = content;
            }else
            {
                console.log(div);
            }
        }
        _showDiv(div, visible);
        return div;
    };

    /**
     *
     * @param div
     * @param visible
     * @private
     */
    function _showDiv(div, visible){
        var style = window.getComputedStyle(div);
        var display = style.getPropertyValue('display');
        if(display === '' || display=='none') display = 'block';
        div.setAttribute("style", "display:"+(visible?display:"none"));
    };


    //http://blog.adtile.me/2014/01/16/a-dive-into-plain-javascript/
    function removeClass(el, cls) {
        var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
        el.className = el.className.replace(reg, " ").replace(/(^\s*)|(\s*$)/g,"");
    };

    //http://blog.adtile.me/2014/01/16/a-dive-into-plain-javascript/
    function hasClass(el, cls) {
        if(!el){
            throw "undefined element";
        }
        return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
    };

    function addClass(el, cls){
        el.className += " "+cls;
    };

    return Menu;
})();