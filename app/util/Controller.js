jQuery.sap.declare("demo.util.Controller");

sap.ui.core.mvc.Controller.extend("demo.util.Controller", {
    getEventBus : function () {
        return this.getOwnerComponent().getEventBus();
    },

    getRouter : function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },

    i18n: function(sResource) {
		if (!this.i18nModel) {
			this.i18nModel = this.getView().getModel("i18n");
		}
		return this.i18nModel.getProperty(sResource);
	}
});