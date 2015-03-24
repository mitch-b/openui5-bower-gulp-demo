jQuery.sap.declare("demo.util.Controller");

sap.ui.core.mvc.Controller.extend("demo.util.Controller", {
    getEventBus : function () {
        return this.getOwnerComponent().getEventBus();
    },

    getRouter : function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
    }
});