sap.ui.define([
	"sap/f/library",
	"sap/m/SplitContainer",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (fioriLibrary, SplitContainer, Controller, XMLView, History, UIComponent, JSONModel, ) {
	"use strict";
	return Controller.extend("constants.model.routes.controllers.App1", {
		onInit: function () {
			this.bus = this.getOwnerComponent().getEventBus();
			this.bus.subscribe("flexible", "setDetailPage", this.setDetailPage, this);
			this.oFlexibleColumnLayout = this.byId("fcl");
		},
		onNavPress: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("RouteMaster", {}, true);
			}
		},
		onExit: function () {
			this.bus.unsubscribe("flexible", "setDetailPage", this.setDetailPage, this);
		},
		setDetailPage: function () {
			var LayoutType = {
				TwoColumnsBeginExpanded: "TwoColumnsBeginExpanded",
				ThreeColumnsMidExpanded: "ThreeColumnsMidExpanded"
			};
			this._loadView({
				id: "midView",
				viewName: "NGI1.Ferreterias.view.App1TableDetail"
			}).then(function (detailView) {
				this.oFlexibleColumnLayout.addMidColumnPage(detailView);
				this.oFlexibleColumnLayout.setLayout(LayoutType.TwoColumnsBeginExpanded);
			}.bind(this));
		},
		_loadView: function (options) {
			var mViews = this._mViews = this._mViews || Object.create(null);
			if (!mViews[options.id]) {
				mViews[options.id] = this.getOwnerComponent().runAsOwner(function () {
					return XMLView.create(options);
				});
			}
			return mViews[options.id];
		},
	});
});
