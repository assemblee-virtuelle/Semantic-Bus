import * as mongoose from "mongoose"

// For some reason, IDE is confused

interface Document extends mongoose.Document, mongoose.MongooseDocument, NodeJS.EventEmitter, mongoose.ModelProperties {
  /** Signal that we desire an increment of this documents version. */
  increment(): this;

  /**
   * Returns another Model instance.
   * @param name model name
   */
  model(name: string): mongoose.Model<this>;

  /** Override whether mongoose thinks this doc is deleted or not */
  isDeleted(isDeleted: boolean): void;
  /** whether mongoose thinks this doc is deleted. */
  isDeleted(): boolean;

  /**
   * Removes this document from the db.
   * @param fn optional callback
   */
  remove(fn?: (err: any, product: this) => void): Promise<this>;

  /**
   * Saves this document.
   * @param options options optional options
   * @param options.safe overrides schema's safe option
   * @param options.validateBeforeSave set to false to save without validating.
   * @param fn optional callback
   */
  save(options?: mongoose.SaveOptions, fn?: (err: any, product: this) => void): Promise<this>;
  save(fn?: (err: any, product: this) => void): Promise<this>;

  /**
   * Version using default version key. See http://mongoosejs.com/docs/guide.html#versionKey
   * If you're using another key, you will have to access it using []: doc[_myVersionKey]
   */
  __v?: number;
}