import merge from "lodash.merge";
import ListInputConfig from "./widgets/ListInput";
import { BasicFuncs } from "@react-awesome-query-builder/ui";

const Config = merge(ListInputConfig, {
  funcs: {
    ...BasicFuncs,
  },
  widgets: {
    date: {
      dateFormat: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD",
    },
    datetime: {
      timeFormat: "HH:mm:ss",
      dateFormat: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD HH:mm:ss",
    },
    time: {
      timeFormat: "HH:mm:ss",
      valueFormat: "HH:mm:ss",
    },
  },
});

export default Config;
