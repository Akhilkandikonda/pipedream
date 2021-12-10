import onedrive from "../../microsoft_onedrive.app.mjs";
import base from "../new-file-in-folder/new-file-in-folder.mjs";

const {
  hooks,
  props,
  methods,
  run,
} = base;

export default {
  ...base,
  type: "source",
  key: "microsoft_onedrive-new-file-of-types-in-folder",
  name: "New File of Types in Folder (Instant)",
  description: "Emit an event when a new file of a specific type is created under a directory tree in a OneDrive drive",
  version: "0.0.1",
  dedupe: "unique",
  props: {
    ...props,
    folder: {
      propDefinition: [
        onedrive,
        "folder",
      ],
      description: "The OneDrive folder to watch for new files (leave empty to watch the entire drive)",
      optional: true,
    },
    fileTypes: {
      propDefinition: [
        onedrive,
        "fileTypes",
      ],
    },
  },
  methods: {
    ...methods,
    isItemTypeRelevant(driveItem) {
      const fileType = driveItem?.file?.mimeType;
      return (
        methods.isItemTypeRelevant.call(this, driveItem) &&
        this.fileTypes.includes(fileType)
      );
    },
  },
  hooks,
  run,
};