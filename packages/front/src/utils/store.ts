import { reactive } from "vue";

const store = {
  state: reactive({
    showFormDialog: false,
    showListDialog: false,
  }),

  toggleFormDialogAction(): void {
    console.log("toggleFormDialogAction triggered");
    this.state.showFormDialog = !this.state.showFormDialog;
  },

  toggleListDialogAction(): void {
    console.log("toggleListDialogAction triggered");
    this.state.showListDialog = !this.state.showListDialog;
  },
};

export default store;
