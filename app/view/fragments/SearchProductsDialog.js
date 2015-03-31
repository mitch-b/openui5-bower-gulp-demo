jQuery.sap.require("demo.util.Controller");

demo.util.Controller.extend("demo.view.fragments.SearchProductsDialog", {
  productValueHelp: function (evt) {
    this.changingControlId = evt.getSource().getId();
    this._valueHelpDialog = new sap.ui.xmlfragment(
      "demo.view.fragments.SearchProductsDialog", this);
    this.getView().addDependent(this._valueHelpDialog);
    this._valueHelpDialog.open();
  },

  product_handleValueHelpSearch: function (evt) {
    var sValue = evt.getParameter("value");
    var filterList = [];

    if (sValue) {
      var descFilter = new sap.ui.model.Filter({
        path: "tolower(PRODUCT_DESC)",
        operator: sap.ui.model.FilterOperator.Contains,
        value1: "'" + sValue.toLowerCase() + "'"
      });
      filterList.push(descFilter);
      if (!isNaN(sValue)) {

        var idFilter = new sap.ui.model.Filter({
          path: "PRODUCT_ID",
          operator: sap.ui.model.FilterOperator.Contains,
          value1: sValue
        });
        filterList.push(idFilter);
        var upcFilter = new sap.ui.model.Filter({
          path: "PRODUCT_ATTRIB1",
          operator: sap.ui.model.FilterOperator.Contains,
          value1: sValue
        });
        filterList.push(upcFilter);
      }
    }

    var filters = new sap.ui.model.Filter({filters: filterList, and: false});
    evt.getSource().getBinding("items").filter(filters);
  }
});