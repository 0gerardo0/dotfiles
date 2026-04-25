import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class PanelSettingsPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings('org.gnome.shell.extensions.transparency-panel');

        const page = new Adw.PreferencesPage({
            title: _('Appearance'),
        });
        
        const group = new Adw.PreferencesGroup({
            title: _('Top Bar Style'),
            description: _('Configure the appearance of the top bar')
        });

        const panelOpacity = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 100,
                step_increment: 1,
            }),
            digits: 0,
            draw_value: true,
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true,
        });
        
        panelOpacity.set_value(settings.get_int('panel-opacity'));
        panelOpacity.connect('value-changed', () => {
            settings.set_int('panel-opacity', panelOpacity.get_value());
        });
        
        group.add(buildRow(_('Panel Opacity'), panelOpacity));

        const overviewOpacity = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 100,
                step_increment: 1,
            }),
            digits: 0,
            draw_value: true,
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true,
        });

        overviewOpacity.set_value(settings.get_int('overview-opacity'));
        overviewOpacity.connect('value-changed', () => {
            settings.set_int('overview-opacity', overviewOpacity.get_value());
        });

        group.add(buildRow(_('Overview Opacity'), overviewOpacity));
        page.add(group);
        window.add(page);
    }
}

function buildRow(title, widget) {
    const row = new Adw.ActionRow({ title });
    row.add_suffix(widget);
    widget.set_hexpand(true);
    return row;
}
