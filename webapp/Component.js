sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"NGI1/Ferreterias/model/models",
	"sap/ui/core/routing/HashChanger"
], function (UIComponent, Device, models, HashChanger) {
	"use strict";
	
	jQuery.sap.includeScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.0/jszip.js");
	jQuery.sap.includeScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.0/xlsx.js");

	return UIComponent.extend("NGI1.Ferreterias.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			HashChanger.getInstance().replaceHash("");
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});