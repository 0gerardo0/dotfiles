/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';

// GSettings schema
const COLOR_SCHEMA = 'org.gnome.settings-daemon.plugins.color';

// D-Bus
const BUS_NAME = 'org.gnome.SettingsDaemon.Color';
const OBJECT_PATH = '/org/gnome/SettingsDaemon/Color';

const ColorInterface = `<node>
  <interface name="org.gnome.SettingsDaemon.Color">
    <property name="NightLightActive" type="b" access="read"/>
    <property name="Temperature" type="u" access="read"/>
  </interface>
</node>`;

// Brightness D-Bus
import {loadInterfaceXML} from 'resource:///org/gnome/shell/misc/fileUtils.js'; 

const BRIGHTNESS_BUS_NAME = 'org.gnome.SettingsDaemon.Power';
const BRIGHTNESS_OBJECT_PATH = '/org/gnome/SettingsDaemon/Power';

const TemperatureItem = GObject.registerClass(
class TemperatureItem extends QuickSettings.QuickSlider {
    _init(options) {
        super._init({
            iconName: 'weather-clear-night',
            icon_reactive: true,
        });

        const ColorProxy = Gio.DBusProxy.makeProxyWrapper(ColorInterface);

        // Indicator options
        this._options = options;

        // Night Light GSettings
        this._settings = new Gio.Settings({schema_id: COLOR_SCHEMA});

        // Night Light D-Bus
        this._proxy = new ColorProxy(Gio.DBus.session, BUS_NAME, OBJECT_PATH,
            (proxy, error) => {
                if (error) {
                    log(`ColorProxy: ${error.message}`);
                    return;
                }
                this._proxyChangedId = this._proxy.connect('g-properties-changed',
                    this._sync.bind(this));
                this._sync();
            });
    
    
        this.connect('icon-clicked', () => {
            this._settings.set_boolean('night-light-enabled', 
                !this._settings.get_boolean('night-light-enabled'))
        });



        this.slider.accessible_name = _('Night Light Temperature');
        this._sliderChangedId = this.slider.connect('notify::value', this._sliderChanged.bind(this));

        this.connect('destroy', this._onDestroy.bind(this));
    }

    _sliderChanged() {
        const {swapAxis, minimum, maximum, brightnessSync} = this._options;
        const percent = swapAxis
            ? 1 - this.slider.value
            : this.slider.value;
        const temperature = percent * (maximum - minimum) + minimum;

        // Block updates from ColorProxy over the 5s smear duration (original Implementation)
        // doesn't work, so 2 additional seconds were added
        this._proxy.block_signal_handler(this._proxyChangedId);
        this._blockHandlerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 7000,
            () => this._proxy.unblock_signal_handler(this._proxyChangedId));

        // Update GSettings
        this._settings.set_uint('night-light-temperature', temperature);

    
        if (brightnessSync && this._brightnessProxy.Brightness >= 0)
            this._brightnessProxy.Brightness = this.slider.value * 100;

    }

    _changeSlider(value) {
        this.slider.block_signal_handler(this._sliderChangedId);
        this.slider.value = value;
        this.slider.unblock_signal_handler(this._sliderChangedId);
    }

    _sync() {
        const {showAlways, showStatusIcon, swapAxis, minimum, maximum} = this._options;
        const active = this._proxy.NightLightActive;
        this.visible = active || showAlways;
        // when show always option is active then clicking on the moon icon toggles nightlight
        this.icon_reactive = showAlways;

        const nightLightIndicator = Main.panel.statusArea.quickSettings._nightLight;
        if (nightLightIndicator) {
            nightLightIndicator._indicator.visible = active && showStatusIcon;
        }

        if (active) {
            const percent = (this._proxy.Temperature - minimum) / (maximum - minimum);
            if (swapAxis) 
                this._changeSlider(1 - percent);
        else
                this._changeSlider(percent);
        }
    }

    updateOption(option, value) {
        this._options[option] = value;
        switch (option) {
        case 'showAlways':
        case 'showStatusIcon':
        case 'swapAxis':
            return this._sync();
        }
    }


    _onDestroy() {
        // Unassign DBus proxies
        this._proxy.disconnect(this._proxyChangedId);
        this._proxy = null;

        if(this._blockHandlerId) {
             GLib.Source.remove(this._blockHandlerId)
        }
    }   

});


class NightLightSchedule {
    constructor(settings) {
        this._settings = settings;
    }

    enableTimer() {
        this._settings.set_boolean('night-light-schedule-automatic', false);
        // Update schedule every 1 hour
        this._timerId = setInterval(this._updateSchedule.bind(this), 60 * 60 * 1000);
        // Subscribe to the D-Bus interface of systemd-logind
        this._loginSignal = Gio.DBus.system.signal_subscribe("org.freedesktop.login1", "org.freedesktop.login1.Manager",
            'PrepareForSleep', '/org/freedesktop/login1', null, Gio.DBusSignalFlags.NONE, this._checkWakeup.bind(this) );

        this._updateSchedule();
    }

    disableTimer() {
        if (this._timerId) {
            this._settings.set_boolean('night-light-schedule-automatic', true);
            clearTimeout(this._timerId);
        }
        if (this._loginSignal) {
             Gio.DBus.system.signal_unsubscribe(this._loginSignal);
        }
    }

    _checkWakeup(connection, sender, path, iface, signal, param) {
        const [prepareForSleep] = param.recursiveUnpack();
        /* The dbus method PrepareForSleep is called with parameter "false" if system wakes up from hibernate/sleep
         * https://www.freedesktop.org/software/systemd/man/latest/org.freedesktop.login1.html
         * To be safe we call _updateSchedule() if system wakes up.
         * Otherwise night light may be day mode if the system was in hibernate or sleep state for longer than 6 hours.
         */
        if(!prepareForSleep) {
            this._updateSchedule();
        }
    }

    _updateSchedule() {
        const now = Date.now();
        // Set a schedule span of 6 hours to & from now
        const to = new Date(now + 6 * 60 * 60 * 1000);
        const from = new Date(now - 6 * 60 * 60 * 1000);
        this._settings.set_double('night-light-schedule-to', to.getHours());
        this._settings.set_double('night-light-schedule-from', from.getHours());
    }
}



export default class NightLightSlider extends Extension {

    _create() {
        this._settings = new Gio.Settings({schema_id: COLOR_SCHEMA});
        this._scheduler = new NightLightSchedule(this._settings);
        this._preferences = this.getSettings();

        // We set up listeners for GSettings last because:
        // > Note that @settings only emits this signal if you have read key at
        // > least once while a signal handler was already connected for key.
        this._preferences.connect('changed::minimum', () =>
            this._updateOption('minimum', this._preferences.get_int('minimum')));
        this._preferences.connect('changed::maximum', () =>
            this._updateOption('maximum', this._preferences.get_int('maximum')));
        this._preferences.connect('changed::swap-axis', () =>
            this._updateOption('swapAxis', this._preferences.get_boolean('swap-axis')));
        this._preferences.connect('changed::show-always', () =>
            this._updateOption('showAlways', this._preferences.get_boolean('show-always')));
        this._preferences.connect('changed::show-status-icon', () =>
            this._updateOption('showStatusIcon', this._preferences.get_boolean('show-status-icon')));
        this._preferences.connect('changed::brightness-sync', () =>
            this._updateOption('brightnessSync', this._preferences.get_boolean('brightness-sync')));

        // Set up hook to recreate indicator on settings change
        this._preferences.connect('changed::show-in-submenu', () => {
            if (!this._nightLight)
                return;
            this._nightLight.destroy();
            this._create();
        });

        // Set up hook to update scheduler
        this._preferences.connect('changed::enable-always', () => {
            if (!this._nightLight)
                return;
            this._setupScheduler();
        });


        this._nightLight = new TemperatureItem({
            minimum: this._preferences.get_int('minimum'),
            maximum: this._preferences.get_int('maximum'),
            swapAxis: this._preferences.get_boolean('swap-axis'),
            showAlways: this._preferences.get_boolean('show-always'),
            showStatusIcon: this._preferences.get_boolean('show-status-icon'),
            brightnessSync: this._preferences.get_boolean('brightness-sync'),
        });


       const QuickSettingsPanel = Main.panel.statusArea.quickSettings
       const QuickSettingsMenu = QuickSettingsPanel.menu

       // Show slider after 1.5s. If not then _brightness could yet be uninitialized and the nightlightslider has the wrong position.
       this._delayHandlerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () =>  {
            QuickSettingsMenu.addItem(this._nightLight, 2);
            QuickSettingsMenu._grid.set_child_above_sibling(
                    this._nightLight,
                    QuickSettingsPanel._brightness.quickSettingsItems[0]
                )
            }) 
    }


    _setupScheduler() {
        if (this._preferences.get_boolean('enable-always'))
            this._scheduler.enableTimer();
        else
            this._scheduler.disableTimer();
    }  

    _updateOption(key, value) {
        if (!this._nightLight)
            return;
        this._nightLight.updateOption(key, value);
    }

    enable() {
        this._create();
        this._setupScheduler();
    }

    disable() {
        if(this._delayHandlerId) {
             GLib.Source.remove(this._delayHandlerId)
        }
        this._nightLight.destroy()
        this._scheduler.disableTimer();
        this._preferences = null;
        this._scheduler = null;
        this._settings = null;
        this._nightLight = null;
    }

}
