import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk";

import { ExtensionPreferences, gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

function formatBirthdayDate(year, month, day) {
  const monthString = month < 10 ? `0${month}` : `${month}`;
  const dayString = day < 10 ? `0${day}` : `${day}`;

  return `${year}/${monthString}/${dayString}`;
}

export default class MementoMoriPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const birthYear = settings.get_int("birth-year");
    const birthMonth = settings.get_int("birth-month");
    const birthDay = settings.get_int("birth-day");

    const preferencesPage = new Adw.PreferencesPage();
    window.add(preferencesPage);

    const counterGroup = new Adw.PreferencesGroup({
      title: _("Counter"),
    });
    preferencesPage.add(counterGroup);

    const formatStringActionRow = new Adw.ActionRow({
      title: _("Format string"),
      subtitle: _("Hover over the entry to get more info"),
    });
    counterGroup.add(formatStringActionRow);

    const formatStringEntryBuffer = new Gtk.EntryBuffer();
    settings.bind("format-string", formatStringEntryBuffer, "text", Gio.SettingsBindFlags.DEFAULT);

    const formatStringEntry = new Gtk.Entry({
      buffer: formatStringEntryBuffer,
      marginTop: 10,
      marginBottom: 10,
      widthRequest: 168,
      placeholderText: _("${w} weeks remaining"),
      tooltipText: _(
        "Available variables for representing\n" +
          "total number of <blank> remaining:\n" +
          "  - ${y}: Years\n" +
          "  - ${M}: Months\n" +
          "  - ${w}: Weeks\n" +
          "  - ${d}: Days\n" +
          "  - ${h}: Hours\n" +
          "  - ${m}: Minutes\n" +
          "  - ${s}: Seconds",
      ),
    });
    formatStringActionRow.add_suffix(formatStringEntry);
    formatStringActionRow.set_activatable_widget(formatStringEntry);

    const birthdayActionRow = new Adw.ActionRow({
      title: _("Birthday"),
      subtitle: _("Your birthday in the form YYYY/MM/DD"),
    });
    counterGroup.add(birthdayActionRow);

    const birthdayButton = new Gtk.MenuButton({
      label: formatBirthdayDate(birthYear, birthMonth, birthDay),
      marginTop: 10,
      marginBottom: 10,
    });
    birthdayActionRow.add_suffix(birthdayButton);
    birthdayActionRow.set_activatable_widget(birthdayButton);

    const birthdayPopover = new Gtk.Popover();
    birthdayButton.set_popover(birthdayPopover);

    const birthdayCalendar = new Gtk.Calendar();
    birthdayCalendar.select_day(GLib.DateTime.new_local(birthYear, birthMonth, birthDay, 0, 0, 0));
    birthdayPopover.set_child(birthdayCalendar);

    function syncSettings(calendar) {
      const year = calendar.year;
      const month = calendar.month + 1;
      const day = calendar.day;

      birthdayButton.set_label(formatBirthdayDate(year, month, day));

      settings.set_int("birth-year", year);
      settings.set_int("birth-month", month);
      settings.set_int("birth-day", day);
    }

    for (const event of ["day-selected", "prev-year", "next-year", "prev-month", "next-month"]) {
      birthdayCalendar.connect(event, (calendar) => {
        syncSettings(calendar);
      });
    }

    const lifeExpectancyActionRow = new Adw.ActionRow({
      title: _("Life expectancy"),
      subtitle: _("Life expectancy at birth in years"),
    });
    counterGroup.add(lifeExpectancyActionRow);

    const lifeExpectancySpinButton = new Gtk.SpinButton({
      adjustment: new Gtk.Adjustment({
        lower: 0,
        upper: 200,
        stepIncrement: 1,
      }),
      numeric: true,
      marginTop: 10,
      marginBottom: 10,
    });
    lifeExpectancyActionRow.add_suffix(lifeExpectancySpinButton);
    lifeExpectancyActionRow.set_activatable_widget(lifeExpectancySpinButton);

    settings.bind("life-expectancy", lifeExpectancySpinButton, "value", Gio.SettingsBindFlags.DEFAULT);

    const appearanceGroup = new Adw.PreferencesGroup({
      title: _("Appearance"),
    });
    preferencesPage.add(appearanceGroup);

    const extensionPositionOptions = new Gtk.StringList();
    extensionPositionOptions.append(_("Left"));
    extensionPositionOptions.append(_("Center"));
    extensionPositionOptions.append(_("Right"));

    const extensionPositionComboRow = new Adw.ComboRow({
      title: _("Extension position"),
      subtitle: _("Position of the extension in the panel"),
      model: extensionPositionOptions,
      selected: settings.get_enum("extension-position"),
    });
    extensionPositionComboRow.connect("notify::selected", (comboRow) => {
      settings.set_enum("extension-position", comboRow.selected);
    });
    appearanceGroup.add(extensionPositionComboRow);

    const extensionIndexActionRow = new Adw.ActionRow({
      title: _("Extension index"),
      subtitle: _("Index of the extension in the panel"),
    });
    appearanceGroup.add(extensionIndexActionRow);

    const extensionIndexSpinButton = new Gtk.SpinButton({
      adjustment: new Gtk.Adjustment({
        lower: 0,
        upper: 10,
        stepIncrement: 1,
      }),
      numeric: true,
      marginTop: 10,
      marginBottom: 10,
    });
    extensionIndexActionRow.add_suffix(extensionIndexSpinButton);
    extensionIndexActionRow.set_activatable_widget(extensionIndexSpinButton);

    settings.bind("extension-index", extensionIndexSpinButton, "value", Gio.SettingsBindFlags.DEFAULT);
  }
}
