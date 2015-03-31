jQuery.sap.require("demo.util.Controller");

demo.util.Controller.extend("demo.view.fragments.SearchCustomersDialog", {
  changingControlId: '', // used by help dialog to adjust control with new value from help dialog

  customerValueHelp: function (evt) {
    this.changingControlId = evt.getSource().getId();
    this._valueHelpDialog = new sap.ui.xmlfragment(
      "demo.view.fragments.SearchCustomersDialog", this);
    this.getView().addDependent(this._valueHelpDialog);
    this._valueHelpDialog.open();
  },

  customer_handleValueHelpSearch: function (evt) {
    var sValue = evt.getParameter("value");
    var filterList = [];
    if (sValue) {
      var descFilter = new sap.ui.model.Filter({
        path: "tolower(CUSTOMER_LVL_DESC1)",
        operator: sap.ui.model.FilterOperator.Contains,
        value1: "'" + sValue.toLowerCase() + "'"
      });
      filterList.push(descFilter);
      var idFilter = new sap.ui.model.Filter({
        path: "CUSTOMER_LVL_ID1",
        operator: sap.ui.model.FilterOperator.Contains,
        value1: sValue
      });
      filterList.push(idFilter);
    }

    var filters = new sap.ui.model.Filter({filters: filterList, and: false});
    evt.getSource().getBinding("items").filter(filters);
  }
});