'use strict';

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
        this.title = menuElement.title;

        //this is the main div for this menuBar. all hidden except the first level
        this.el = _createDiv(this.id, parentMenuBar === null, 'menubar');

        //create a title div for the menubar
        var titlediv = _createDiv((this.id + '_title'), true, 'menutitle');
        titlediv.innerText = this.title;
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


    //------- menu entry class ----------

    /**
     * if target = Menubar, this is an entry that controls a submenu.
     */
    var MenuEntry = function(entryElement, menuBarParent, target){
        this.parent = menuBarParent;
        this.id = entryElement.id;
        this.title = entryElement.innerText;
        this.target = target;
        var classname = 'entry';
        if(target !== undefined && target instanceof MenuBar){
            classname = 'menuentry';
        }
        this.el = _createDiv(this.id, true, classname);
        this.el.innerHTML = this.title;
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

        /*
         * affects the way key events are processed on the entermenu button callback.
         * focus can be also gained through clicking.
         */
        this.focused = false;

        var self = this;

        var entermenubtn = document.getElementById(buttonid);
        entermenubtn.addEventListener("click", function(ev){
            self.onEnterMenu();
        });

        entermenubtn.addEventListener('keydown',function(ev){
            if(self.focused){
                self.onKeyDown(ev);
            }else{
                self.onEnterMenu();
            }
        },true);

        this.build();

        this.menudiv.addEventListener("click", function(ev){self.onClick(ev.srcElement);});

    };

    /**
     * iterate over the nested collection of ul and li, to build a model of them, while flatting the dom
     */
    Menu.prototype.build = function(){
        //this is the level 1
        var menu = this.menudiv.querySelector("menu");
        this.menudiv.removeChild(menu);
        this.menuBarContainer = _createDiv("menuBarContainer", true, 'menubarcontainer');
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
        }else if(key === 39){ //left
            console.log("left");
        }else if(key === 37){//right
            console.log("right");
        }else if(key === 13){//enter
            if(!this.focused){
                this.onEnterMenu();
            }else{
                console.log("eeenteer");
            }
        }else{
            console.log(event.keyCode);
        }

    };

    /**
     * handles on click events. receives the source DOM element
     */
    Menu.prototype.onClick = function(srcElement){

        console.log("Menu.onClick ", srcElement.id , srcElement.className);

        if(hasClass(srcElement, 'menutitle')){

        }else if(hasClass(srcElement, 'menucontainer')){

        }else if(hasClass(srcElement, 'menubar')){

        }else if(hasClass(srcElement, 'menuentry') || hasClass(srcElement, 'entry')){
            var entry = this.rootMenuBar.findEntry(srcElement.id);
            if(entry != null) entry.execute(this.context);
        }
    };




    /**
     * invoked by either clicking or pressing enter, be sure to call it only once!
     */
    Menu.prototype.onEnterMenu = function(){
        if(!this.focused){
            this.focused = true;
            console.log("Menu.onEnterMenu ");
        }
    };

    //--- private module methods ---

    function _createDiv(id, visible, classname){
        var div = document.createElement("div");
        div.id = id;
        if(classname !== undefined){
            div.className = classname;
        }
        _showDiv(div, visible);
        return div;
    };

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
    }

    //http://blog.adtile.me/2014/01/16/a-dive-into-plain-javascript/
    function hasClass(el, cls) {
        return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
    }

    function addClass(el, cls){
        el.className += " "+cls;
    }

    return Menu;
})();