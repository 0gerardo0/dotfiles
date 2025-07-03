import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

export default class TransparencyExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._settings = null;
        this._settingsChangedId = null;
        this._styleChangedTimeoutId = null;
        this._overviewShowingId = null;
        this._overviewHidingId = null;
        this._panelStyleOriginal = null;
        this._overviewStyleApplied = false;
    }

    enable() {
        this._settings = this.getSettings('org.gnome.shell.extensions.transparency-panel');
        this._settingsChangedId = this._settings.connect('changed', this._onSettingsChanged.bind(this));
        this._overviewShowingId = Main.overview.connect('showing', this._onOverviewShowing.bind(this));
        this._overviewHidingId = Main.overview.connect('hiding', this._onOverviewHiding.bind(this));
        
        this._applyStyles();
    }

    disable() {
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }
        if (this._overviewShowingId) {
            Main.overview.disconnect(this._overviewShowingId);
            this._overviewShowingId = null;
        }
        if (this._overviewHidingId) {
            Main.overview.disconnect(this._overviewHidingId);
            this._overviewHidingId = null;
        }
        if (this._styleChangedTimeoutId) {
            GLib.source_remove(this._styleChangedTimeoutId);
            this._styleChangedTimeoutId = null;
        }
        
        this._removeCustomStyles();
        this._settings = null;
    }

    _onSettingsChanged(settings, key) {
        if (this._styleChangedTimeoutId) {
            GLib.source_remove(this._styleChangedTimeoutId);
        }
        this._styleChangedTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 300, () => {
            this._applyStyles();
            this._styleChangedTimeoutId = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    _onOverviewShowing() {
        this._panelStyleOriginal = Main.panel.style;
        this._applyOverviewStyles();
    }
    _onOverviewHiding() {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 300, () => {
            this._removeOverviewStyles();
            this._applyStyles();
            return GLib.SOURCE_REMOVE;
        });
    }

    _applyOverviewStyles() {
        if (this._overviewStyleApplied) 
          return;
        const opacity = this._settings.get_int('overview-opacity') / 100;
        Main.panel.style = `background-color: rgba(50, 50, 50, ${opacity});`;
        Main.panel.add_style_class_name('CSSstylePanel-overview');
        this._overviewStyleApplied = true;
    }

    _removeOverviewStyles() {
        Main.panel.style = null;
        Main.panel.remove_style_class_name('CSSstylePanel-overview');
        this._overviewStyleApplied = false;
    }

    _applyStyles() {
        Main.panel.add_style_class_name('CSSstylePanel');
        const addStyleClass = Main.panel.statusArea.quickSettings;
        if (addStyleClass) {
            addStyleClass.menu.actor.add_style_class_name('CSSstylePanel-qs');
        }
        if (Main.overview.visible || this._overviewStyleApplied) {
            return;
        }
        const panelOpacity = this._settings.get_int('panel-opacity') / 100;
        const panelStyle = `background-color: rgba(50, 50, 50, ${panelOpacity});`;
        Main.panel.style = panelStyle;
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 300, () => {
            if (!Main.overview.visible && Main.panel.style !== panelStyle) {
                Main.panel.style = panelStyle;
            }
            return GLib.SOURCE_REMOVE;
        });
    }

    _removeCustomStyles() {
        Main.panel.remove_style_class_name('CSSstylePanel');
        const addStyleClass = Main.panel.statusArea.quickSettings;
        if (addStyleClass) {
            addStyleClass.menu.actor.remove_style_class_name('CSSstylePanel-qs');
        }
        Main.panel.style = null;
    }
}
