sap.ui.define([], function () {
	'use strict';
	return {
		model: {
			routes: {
				controllers: {
					Master: "NGI1.Ferreterias.controller.Master",
					App1Controller: "NGI1.Ferreterias.controller.App1",
					App1Table: "NGI1.Ferreterias.controller.App1Table",
					App1TableDetail: "NGI1.Ferreterias.controller.App1TableDetail",
					App2: "NGI1.Ferreterias.controller.App2",
					App3: "NGI1.Ferreterias.controller.App3",
					App3SellProductWizard: "NGI1.Ferreterias.controller.App3SellProductWizard",
					App4: "NGI1.Ferreterias.controller.App4"
				}
				,
				fragments: {
					App1DialogUploadExcel: "NGI1.Ferreterias.utils.fragments.App1DialogUploadExcel",
					App2DialogAddProduct: "NGI1.Ferreterias.utils.fragments.App2DialogAddProduct",
					App2DialogAddProduct: "NGI1.Ferreterias.utils.fragments.App2DialogAddProduct"
				}
			}
		}
	};
}, true);
