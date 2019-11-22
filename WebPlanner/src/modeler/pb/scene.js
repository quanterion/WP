/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.pb = (function() {

    /**
     * Namespace pb.
     * @exports pb
     * @namespace
     */
    var pb = {};

    pb.Common = (function() {

        /**
         * Properties of a Common.
         * @memberof pb
         * @interface ICommon
         * @property {string|null} [name] Common name
         * @property {string|null} [type] Common type
         * @property {number|null} [catalog] Common catalog
         * @property {boolean|null} [assembly] Common assembly
         * @property {string|null} [layer] Common layer
         * @property {number|null} [group] Common group
         */

        /**
         * Constructs a new Common.
         * @memberof pb
         * @classdesc Represents a Common.
         * @implements ICommon
         * @constructor
         * @param {pb.ICommon=} [properties] Properties to set
         */
        function Common(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Common name.
         * @member {string} name
         * @memberof pb.Common
         * @instance
         */
        Common.prototype.name = "";

        /**
         * Common type.
         * @member {string} type
         * @memberof pb.Common
         * @instance
         */
        Common.prototype.type = "";

        /**
         * Common catalog.
         * @member {number} catalog
         * @memberof pb.Common
         * @instance
         */
        Common.prototype.catalog = 0;

        /**
         * Common assembly.
         * @member {boolean} assembly
         * @memberof pb.Common
         * @instance
         */
        Common.prototype.assembly = false;

        /**
         * Common layer.
         * @member {string} layer
         * @memberof pb.Common
         * @instance
         */
        Common.prototype.layer = "";

        /**
         * Common group.
         * @member {number} group
         * @memberof pb.Common
         * @instance
         */
        Common.prototype.group = 0;

        /**
         * Creates a new Common instance using the specified properties.
         * @function create
         * @memberof pb.Common
         * @static
         * @param {pb.ICommon=} [properties] Properties to set
         * @returns {pb.Common} Common instance
         */
        Common.create = function create(properties) {
            return new Common(properties);
        };

        /**
         * Encodes the specified Common message. Does not implicitly {@link pb.Common.verify|verify} messages.
         * @function encode
         * @memberof pb.Common
         * @static
         * @param {pb.ICommon} message Common message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Common.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.type != null && message.hasOwnProperty("type"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
            if (message.catalog != null && message.hasOwnProperty("catalog"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.catalog);
            if (message.assembly != null && message.hasOwnProperty("assembly"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.assembly);
            if (message.layer != null && message.hasOwnProperty("layer"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.layer);
            if (message.group != null && message.hasOwnProperty("group"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.group);
            return writer;
        };

        /**
         * Encodes the specified Common message, length delimited. Does not implicitly {@link pb.Common.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Common
         * @static
         * @param {pb.ICommon} message Common message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Common.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Common message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Common
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Common} Common
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Common.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Common();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 3:
                    message.type = reader.string();
                    break;
                case 4:
                    message.catalog = reader.uint32();
                    break;
                case 5:
                    message.assembly = reader.bool();
                    break;
                case 6:
                    message.layer = reader.string();
                    break;
                case 7:
                    message.group = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Common message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Common
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Common} Common
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Common.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Common message.
         * @function verify
         * @memberof pb.Common
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Common.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.catalog != null && message.hasOwnProperty("catalog"))
                if (!$util.isInteger(message.catalog))
                    return "catalog: integer expected";
            if (message.assembly != null && message.hasOwnProperty("assembly"))
                if (typeof message.assembly !== "boolean")
                    return "assembly: boolean expected";
            if (message.layer != null && message.hasOwnProperty("layer"))
                if (!$util.isString(message.layer))
                    return "layer: string expected";
            if (message.group != null && message.hasOwnProperty("group"))
                if (!$util.isInteger(message.group))
                    return "group: integer expected";
            return null;
        };

        /**
         * Creates a Common message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Common
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Common} Common
         */
        Common.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Common)
                return object;
            var message = new $root.pb.Common();
            if (object.name != null)
                message.name = String(object.name);
            if (object.type != null)
                message.type = String(object.type);
            if (object.catalog != null)
                message.catalog = object.catalog >>> 0;
            if (object.assembly != null)
                message.assembly = Boolean(object.assembly);
            if (object.layer != null)
                message.layer = String(object.layer);
            if (object.group != null)
                message.group = object.group >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a Common message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Common
         * @static
         * @param {pb.Common} message Common
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Common.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.type = "";
                object.catalog = 0;
                object.assembly = false;
                object.layer = "";
                object.group = 0;
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.catalog != null && message.hasOwnProperty("catalog"))
                object.catalog = message.catalog;
            if (message.assembly != null && message.hasOwnProperty("assembly"))
                object.assembly = message.assembly;
            if (message.layer != null && message.hasOwnProperty("layer"))
                object.layer = message.layer;
            if (message.group != null && message.hasOwnProperty("group"))
                object.group = message.group;
            return object;
        };

        /**
         * Converts this Common to JSON.
         * @function toJSON
         * @memberof pb.Common
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Common.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Common;
    })();

    pb.Transform = (function() {

        /**
         * Properties of a Transform.
         * @memberof pb
         * @interface ITransform
         * @property {Array.<number>|null} [matrix] Transform matrix
         * @property {number|null} [flags] Transform flags
         * @property {Array.<number>|null} [box] Transform box
         * @property {Array.<number>|null} [contentBox] Transform contentBox
         * @property {Array.<number>|null} [exactBox] Transform exactBox
         */

        /**
         * Constructs a new Transform.
         * @memberof pb
         * @classdesc Represents a Transform.
         * @implements ITransform
         * @constructor
         * @param {pb.ITransform=} [properties] Properties to set
         */
        function Transform(properties) {
            this.matrix = [];
            this.box = [];
            this.contentBox = [];
            this.exactBox = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Transform matrix.
         * @member {Array.<number>} matrix
         * @memberof pb.Transform
         * @instance
         */
        Transform.prototype.matrix = $util.emptyArray;

        /**
         * Transform flags.
         * @member {number} flags
         * @memberof pb.Transform
         * @instance
         */
        Transform.prototype.flags = 0;

        /**
         * Transform box.
         * @member {Array.<number>} box
         * @memberof pb.Transform
         * @instance
         */
        Transform.prototype.box = $util.emptyArray;

        /**
         * Transform contentBox.
         * @member {Array.<number>} contentBox
         * @memberof pb.Transform
         * @instance
         */
        Transform.prototype.contentBox = $util.emptyArray;

        /**
         * Transform exactBox.
         * @member {Array.<number>} exactBox
         * @memberof pb.Transform
         * @instance
         */
        Transform.prototype.exactBox = $util.emptyArray;

        /**
         * Creates a new Transform instance using the specified properties.
         * @function create
         * @memberof pb.Transform
         * @static
         * @param {pb.ITransform=} [properties] Properties to set
         * @returns {pb.Transform} Transform instance
         */
        Transform.create = function create(properties) {
            return new Transform(properties);
        };

        /**
         * Encodes the specified Transform message. Does not implicitly {@link pb.Transform.verify|verify} messages.
         * @function encode
         * @memberof pb.Transform
         * @static
         * @param {pb.ITransform} message Transform message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transform.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.matrix != null && message.matrix.length) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork();
                for (var i = 0; i < message.matrix.length; ++i)
                    writer.double(message.matrix[i]);
                writer.ldelim();
            }
            if (message.flags != null && message.hasOwnProperty("flags"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.flags);
            if (message.box != null && message.box.length) {
                writer.uint32(/* id 3, wireType 2 =*/26).fork();
                for (var i = 0; i < message.box.length; ++i)
                    writer.double(message.box[i]);
                writer.ldelim();
            }
            if (message.contentBox != null && message.contentBox.length) {
                writer.uint32(/* id 4, wireType 2 =*/34).fork();
                for (var i = 0; i < message.contentBox.length; ++i)
                    writer.double(message.contentBox[i]);
                writer.ldelim();
            }
            if (message.exactBox != null && message.exactBox.length) {
                writer.uint32(/* id 5, wireType 2 =*/42).fork();
                for (var i = 0; i < message.exactBox.length; ++i)
                    writer.double(message.exactBox[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified Transform message, length delimited. Does not implicitly {@link pb.Transform.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Transform
         * @static
         * @param {pb.ITransform} message Transform message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transform.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Transform message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Transform
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Transform} Transform
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transform.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Transform();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.matrix && message.matrix.length))
                        message.matrix = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.matrix.push(reader.double());
                    } else
                        message.matrix.push(reader.double());
                    break;
                case 2:
                    message.flags = reader.uint32();
                    break;
                case 3:
                    if (!(message.box && message.box.length))
                        message.box = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.box.push(reader.double());
                    } else
                        message.box.push(reader.double());
                    break;
                case 4:
                    if (!(message.contentBox && message.contentBox.length))
                        message.contentBox = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.contentBox.push(reader.double());
                    } else
                        message.contentBox.push(reader.double());
                    break;
                case 5:
                    if (!(message.exactBox && message.exactBox.length))
                        message.exactBox = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.exactBox.push(reader.double());
                    } else
                        message.exactBox.push(reader.double());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Transform message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Transform
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Transform} Transform
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transform.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Transform message.
         * @function verify
         * @memberof pb.Transform
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Transform.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.matrix != null && message.hasOwnProperty("matrix")) {
                if (!Array.isArray(message.matrix))
                    return "matrix: array expected";
                for (var i = 0; i < message.matrix.length; ++i)
                    if (typeof message.matrix[i] !== "number")
                        return "matrix: number[] expected";
            }
            if (message.flags != null && message.hasOwnProperty("flags"))
                if (!$util.isInteger(message.flags))
                    return "flags: integer expected";
            if (message.box != null && message.hasOwnProperty("box")) {
                if (!Array.isArray(message.box))
                    return "box: array expected";
                for (var i = 0; i < message.box.length; ++i)
                    if (typeof message.box[i] !== "number")
                        return "box: number[] expected";
            }
            if (message.contentBox != null && message.hasOwnProperty("contentBox")) {
                if (!Array.isArray(message.contentBox))
                    return "contentBox: array expected";
                for (var i = 0; i < message.contentBox.length; ++i)
                    if (typeof message.contentBox[i] !== "number")
                        return "contentBox: number[] expected";
            }
            if (message.exactBox != null && message.hasOwnProperty("exactBox")) {
                if (!Array.isArray(message.exactBox))
                    return "exactBox: array expected";
                for (var i = 0; i < message.exactBox.length; ++i)
                    if (typeof message.exactBox[i] !== "number")
                        return "exactBox: number[] expected";
            }
            return null;
        };

        /**
         * Creates a Transform message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Transform
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Transform} Transform
         */
        Transform.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Transform)
                return object;
            var message = new $root.pb.Transform();
            if (object.matrix) {
                if (!Array.isArray(object.matrix))
                    throw TypeError(".pb.Transform.matrix: array expected");
                message.matrix = [];
                for (var i = 0; i < object.matrix.length; ++i)
                    message.matrix[i] = Number(object.matrix[i]);
            }
            if (object.flags != null)
                message.flags = object.flags >>> 0;
            if (object.box) {
                if (!Array.isArray(object.box))
                    throw TypeError(".pb.Transform.box: array expected");
                message.box = [];
                for (var i = 0; i < object.box.length; ++i)
                    message.box[i] = Number(object.box[i]);
            }
            if (object.contentBox) {
                if (!Array.isArray(object.contentBox))
                    throw TypeError(".pb.Transform.contentBox: array expected");
                message.contentBox = [];
                for (var i = 0; i < object.contentBox.length; ++i)
                    message.contentBox[i] = Number(object.contentBox[i]);
            }
            if (object.exactBox) {
                if (!Array.isArray(object.exactBox))
                    throw TypeError(".pb.Transform.exactBox: array expected");
                message.exactBox = [];
                for (var i = 0; i < object.exactBox.length; ++i)
                    message.exactBox[i] = Number(object.exactBox[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from a Transform message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Transform
         * @static
         * @param {pb.Transform} message Transform
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Transform.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.matrix = [];
                object.box = [];
                object.contentBox = [];
                object.exactBox = [];
            }
            if (options.defaults)
                object.flags = 0;
            if (message.matrix && message.matrix.length) {
                object.matrix = [];
                for (var j = 0; j < message.matrix.length; ++j)
                    object.matrix[j] = options.json && !isFinite(message.matrix[j]) ? String(message.matrix[j]) : message.matrix[j];
            }
            if (message.flags != null && message.hasOwnProperty("flags"))
                object.flags = message.flags;
            if (message.box && message.box.length) {
                object.box = [];
                for (var j = 0; j < message.box.length; ++j)
                    object.box[j] = options.json && !isFinite(message.box[j]) ? String(message.box[j]) : message.box[j];
            }
            if (message.contentBox && message.contentBox.length) {
                object.contentBox = [];
                for (var j = 0; j < message.contentBox.length; ++j)
                    object.contentBox[j] = options.json && !isFinite(message.contentBox[j]) ? String(message.contentBox[j]) : message.contentBox[j];
            }
            if (message.exactBox && message.exactBox.length) {
                object.exactBox = [];
                for (var j = 0; j < message.exactBox.length; ++j)
                    object.exactBox[j] = options.json && !isFinite(message.exactBox[j]) ? String(message.exactBox[j]) : message.exactBox[j];
            }
            return object;
        };

        /**
         * Converts this Transform to JSON.
         * @function toJSON
         * @memberof pb.Transform
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Transform.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Transform;
    })();

    pb.Geometry = (function() {

        /**
         * Properties of a Geometry.
         * @memberof pb
         * @interface IGeometry
         * @property {Array.<pb.Geometry.IGrid>|null} [grid] Geometry grid
         * @property {Array.<pb.Geometry.IEdge>|null} [edge] Geometry edge
         * @property {string|null} [materials] Geometry materials
         */

        /**
         * Constructs a new Geometry.
         * @memberof pb
         * @classdesc Represents a Geometry.
         * @implements IGeometry
         * @constructor
         * @param {pb.IGeometry=} [properties] Properties to set
         */
        function Geometry(properties) {
            this.grid = [];
            this.edge = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Geometry grid.
         * @member {Array.<pb.Geometry.IGrid>} grid
         * @memberof pb.Geometry
         * @instance
         */
        Geometry.prototype.grid = $util.emptyArray;

        /**
         * Geometry edge.
         * @member {Array.<pb.Geometry.IEdge>} edge
         * @memberof pb.Geometry
         * @instance
         */
        Geometry.prototype.edge = $util.emptyArray;

        /**
         * Geometry materials.
         * @member {string} materials
         * @memberof pb.Geometry
         * @instance
         */
        Geometry.prototype.materials = "";

        /**
         * Creates a new Geometry instance using the specified properties.
         * @function create
         * @memberof pb.Geometry
         * @static
         * @param {pb.IGeometry=} [properties] Properties to set
         * @returns {pb.Geometry} Geometry instance
         */
        Geometry.create = function create(properties) {
            return new Geometry(properties);
        };

        /**
         * Encodes the specified Geometry message. Does not implicitly {@link pb.Geometry.verify|verify} messages.
         * @function encode
         * @memberof pb.Geometry
         * @static
         * @param {pb.IGeometry} message Geometry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Geometry.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.grid != null && message.grid.length)
                for (var i = 0; i < message.grid.length; ++i)
                    $root.pb.Geometry.Grid.encode(message.grid[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.edge != null && message.edge.length)
                for (var i = 0; i < message.edge.length; ++i)
                    $root.pb.Geometry.Edge.encode(message.edge[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.materials != null && message.hasOwnProperty("materials"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.materials);
            return writer;
        };

        /**
         * Encodes the specified Geometry message, length delimited. Does not implicitly {@link pb.Geometry.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Geometry
         * @static
         * @param {pb.IGeometry} message Geometry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Geometry.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Geometry message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Geometry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Geometry} Geometry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Geometry.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Geometry();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.grid && message.grid.length))
                        message.grid = [];
                    message.grid.push($root.pb.Geometry.Grid.decode(reader, reader.uint32()));
                    break;
                case 2:
                    if (!(message.edge && message.edge.length))
                        message.edge = [];
                    message.edge.push($root.pb.Geometry.Edge.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.materials = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Geometry message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Geometry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Geometry} Geometry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Geometry.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Geometry message.
         * @function verify
         * @memberof pb.Geometry
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Geometry.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.grid != null && message.hasOwnProperty("grid")) {
                if (!Array.isArray(message.grid))
                    return "grid: array expected";
                for (var i = 0; i < message.grid.length; ++i) {
                    var error = $root.pb.Geometry.Grid.verify(message.grid[i]);
                    if (error)
                        return "grid." + error;
                }
            }
            if (message.edge != null && message.hasOwnProperty("edge")) {
                if (!Array.isArray(message.edge))
                    return "edge: array expected";
                for (var i = 0; i < message.edge.length; ++i) {
                    var error = $root.pb.Geometry.Edge.verify(message.edge[i]);
                    if (error)
                        return "edge." + error;
                }
            }
            if (message.materials != null && message.hasOwnProperty("materials"))
                if (!$util.isString(message.materials))
                    return "materials: string expected";
            return null;
        };

        /**
         * Creates a Geometry message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Geometry
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Geometry} Geometry
         */
        Geometry.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Geometry)
                return object;
            var message = new $root.pb.Geometry();
            if (object.grid) {
                if (!Array.isArray(object.grid))
                    throw TypeError(".pb.Geometry.grid: array expected");
                message.grid = [];
                for (var i = 0; i < object.grid.length; ++i) {
                    if (typeof object.grid[i] !== "object")
                        throw TypeError(".pb.Geometry.grid: object expected");
                    message.grid[i] = $root.pb.Geometry.Grid.fromObject(object.grid[i]);
                }
            }
            if (object.edge) {
                if (!Array.isArray(object.edge))
                    throw TypeError(".pb.Geometry.edge: array expected");
                message.edge = [];
                for (var i = 0; i < object.edge.length; ++i) {
                    if (typeof object.edge[i] !== "object")
                        throw TypeError(".pb.Geometry.edge: object expected");
                    message.edge[i] = $root.pb.Geometry.Edge.fromObject(object.edge[i]);
                }
            }
            if (object.materials != null)
                message.materials = String(object.materials);
            return message;
        };

        /**
         * Creates a plain object from a Geometry message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Geometry
         * @static
         * @param {pb.Geometry} message Geometry
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Geometry.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.grid = [];
                object.edge = [];
            }
            if (options.defaults)
                object.materials = "";
            if (message.grid && message.grid.length) {
                object.grid = [];
                for (var j = 0; j < message.grid.length; ++j)
                    object.grid[j] = $root.pb.Geometry.Grid.toObject(message.grid[j], options);
            }
            if (message.edge && message.edge.length) {
                object.edge = [];
                for (var j = 0; j < message.edge.length; ++j)
                    object.edge[j] = $root.pb.Geometry.Edge.toObject(message.edge[j], options);
            }
            if (message.materials != null && message.hasOwnProperty("materials"))
                object.materials = message.materials;
            return object;
        };

        /**
         * Converts this Geometry to JSON.
         * @function toJSON
         * @memberof pb.Geometry
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Geometry.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Geometry.Grid = (function() {

            /**
             * Properties of a Grid.
             * @memberof pb.Geometry
             * @interface IGrid
             * @property {number|null} [name] Grid name
             * @property {number|null} [catalog] Grid catalog
             * @property {string|null} [material] Grid material
             * @property {number|null} [type] Grid type
             * @property {boolean|null} [swapuv] Grid swapuv
             * @property {Array.<number>|null} [position] Grid position
             * @property {Array.<number>|null} [normal] Grid normal
             * @property {Array.<number>|null} [texture] Grid texture
             * @property {Array.<number>|null} [index] Grid index
             * @property {Uint8Array|null} [draco] Grid draco
             * @property {Array.<number>|null} [size] Grid size
             */

            /**
             * Constructs a new Grid.
             * @memberof pb.Geometry
             * @classdesc Represents a Grid.
             * @implements IGrid
             * @constructor
             * @param {pb.Geometry.IGrid=} [properties] Properties to set
             */
            function Grid(properties) {
                this.position = [];
                this.normal = [];
                this.texture = [];
                this.index = [];
                this.size = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Grid name.
             * @member {number} name
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.name = 0;

            /**
             * Grid catalog.
             * @member {number} catalog
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.catalog = 0;

            /**
             * Grid material.
             * @member {string} material
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.material = "";

            /**
             * Grid type.
             * @member {number} type
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.type = 0;

            /**
             * Grid swapuv.
             * @member {boolean} swapuv
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.swapuv = false;

            /**
             * Grid position.
             * @member {Array.<number>} position
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.position = $util.emptyArray;

            /**
             * Grid normal.
             * @member {Array.<number>} normal
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.normal = $util.emptyArray;

            /**
             * Grid texture.
             * @member {Array.<number>} texture
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.texture = $util.emptyArray;

            /**
             * Grid index.
             * @member {Array.<number>} index
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.index = $util.emptyArray;

            /**
             * Grid draco.
             * @member {Uint8Array} draco
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.draco = $util.newBuffer([]);

            /**
             * Grid size.
             * @member {Array.<number>} size
             * @memberof pb.Geometry.Grid
             * @instance
             */
            Grid.prototype.size = $util.emptyArray;

            /**
             * Creates a new Grid instance using the specified properties.
             * @function create
             * @memberof pb.Geometry.Grid
             * @static
             * @param {pb.Geometry.IGrid=} [properties] Properties to set
             * @returns {pb.Geometry.Grid} Grid instance
             */
            Grid.create = function create(properties) {
                return new Grid(properties);
            };

            /**
             * Encodes the specified Grid message. Does not implicitly {@link pb.Geometry.Grid.verify|verify} messages.
             * @function encode
             * @memberof pb.Geometry.Grid
             * @static
             * @param {pb.Geometry.IGrid} message Grid message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Grid.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && message.hasOwnProperty("name"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.name);
                if (message.material != null && message.hasOwnProperty("material"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.material);
                if (message.position != null && message.position.length) {
                    writer.uint32(/* id 3, wireType 2 =*/26).fork();
                    for (var i = 0; i < message.position.length; ++i)
                        writer.float(message.position[i]);
                    writer.ldelim();
                }
                if (message.normal != null && message.normal.length) {
                    writer.uint32(/* id 4, wireType 2 =*/34).fork();
                    for (var i = 0; i < message.normal.length; ++i)
                        writer.float(message.normal[i]);
                    writer.ldelim();
                }
                if (message.texture != null && message.texture.length) {
                    writer.uint32(/* id 5, wireType 2 =*/42).fork();
                    for (var i = 0; i < message.texture.length; ++i)
                        writer.float(message.texture[i]);
                    writer.ldelim();
                }
                if (message.index != null && message.index.length) {
                    writer.uint32(/* id 6, wireType 2 =*/50).fork();
                    for (var i = 0; i < message.index.length; ++i)
                        writer.uint32(message.index[i]);
                    writer.ldelim();
                }
                if (message.type != null && message.hasOwnProperty("type"))
                    writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.type);
                if (message.catalog != null && message.hasOwnProperty("catalog"))
                    writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.catalog);
                if (message.swapuv != null && message.hasOwnProperty("swapuv"))
                    writer.uint32(/* id 9, wireType 0 =*/72).bool(message.swapuv);
                if (message.draco != null && message.hasOwnProperty("draco"))
                    writer.uint32(/* id 10, wireType 2 =*/82).bytes(message.draco);
                if (message.size != null && message.size.length) {
                    writer.uint32(/* id 11, wireType 2 =*/90).fork();
                    for (var i = 0; i < message.size.length; ++i)
                        writer.float(message.size[i]);
                    writer.ldelim();
                }
                return writer;
            };

            /**
             * Encodes the specified Grid message, length delimited. Does not implicitly {@link pb.Geometry.Grid.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Geometry.Grid
             * @static
             * @param {pb.Geometry.IGrid} message Grid message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Grid.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Grid message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Geometry.Grid
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Geometry.Grid} Grid
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Grid.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Geometry.Grid();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.name = reader.uint32();
                        break;
                    case 8:
                        message.catalog = reader.uint32();
                        break;
                    case 2:
                        message.material = reader.string();
                        break;
                    case 7:
                        message.type = reader.uint32();
                        break;
                    case 9:
                        message.swapuv = reader.bool();
                        break;
                    case 3:
                        if (!(message.position && message.position.length))
                            message.position = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.position.push(reader.float());
                        } else
                            message.position.push(reader.float());
                        break;
                    case 4:
                        if (!(message.normal && message.normal.length))
                            message.normal = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.normal.push(reader.float());
                        } else
                            message.normal.push(reader.float());
                        break;
                    case 5:
                        if (!(message.texture && message.texture.length))
                            message.texture = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.texture.push(reader.float());
                        } else
                            message.texture.push(reader.float());
                        break;
                    case 6:
                        if (!(message.index && message.index.length))
                            message.index = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.index.push(reader.uint32());
                        } else
                            message.index.push(reader.uint32());
                        break;
                    case 10:
                        message.draco = reader.bytes();
                        break;
                    case 11:
                        if (!(message.size && message.size.length))
                            message.size = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.size.push(reader.float());
                        } else
                            message.size.push(reader.float());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Grid message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Geometry.Grid
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Geometry.Grid} Grid
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Grid.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Grid message.
             * @function verify
             * @memberof pb.Geometry.Grid
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Grid.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isInteger(message.name))
                        return "name: integer expected";
                if (message.catalog != null && message.hasOwnProperty("catalog"))
                    if (!$util.isInteger(message.catalog))
                        return "catalog: integer expected";
                if (message.material != null && message.hasOwnProperty("material"))
                    if (!$util.isString(message.material))
                        return "material: string expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    if (!$util.isInteger(message.type))
                        return "type: integer expected";
                if (message.swapuv != null && message.hasOwnProperty("swapuv"))
                    if (typeof message.swapuv !== "boolean")
                        return "swapuv: boolean expected";
                if (message.position != null && message.hasOwnProperty("position")) {
                    if (!Array.isArray(message.position))
                        return "position: array expected";
                    for (var i = 0; i < message.position.length; ++i)
                        if (typeof message.position[i] !== "number")
                            return "position: number[] expected";
                }
                if (message.normal != null && message.hasOwnProperty("normal")) {
                    if (!Array.isArray(message.normal))
                        return "normal: array expected";
                    for (var i = 0; i < message.normal.length; ++i)
                        if (typeof message.normal[i] !== "number")
                            return "normal: number[] expected";
                }
                if (message.texture != null && message.hasOwnProperty("texture")) {
                    if (!Array.isArray(message.texture))
                        return "texture: array expected";
                    for (var i = 0; i < message.texture.length; ++i)
                        if (typeof message.texture[i] !== "number")
                            return "texture: number[] expected";
                }
                if (message.index != null && message.hasOwnProperty("index")) {
                    if (!Array.isArray(message.index))
                        return "index: array expected";
                    for (var i = 0; i < message.index.length; ++i)
                        if (!$util.isInteger(message.index[i]))
                            return "index: integer[] expected";
                }
                if (message.draco != null && message.hasOwnProperty("draco"))
                    if (!(message.draco && typeof message.draco.length === "number" || $util.isString(message.draco)))
                        return "draco: buffer expected";
                if (message.size != null && message.hasOwnProperty("size")) {
                    if (!Array.isArray(message.size))
                        return "size: array expected";
                    for (var i = 0; i < message.size.length; ++i)
                        if (typeof message.size[i] !== "number")
                            return "size: number[] expected";
                }
                return null;
            };

            /**
             * Creates a Grid message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Geometry.Grid
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Geometry.Grid} Grid
             */
            Grid.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Geometry.Grid)
                    return object;
                var message = new $root.pb.Geometry.Grid();
                if (object.name != null)
                    message.name = object.name >>> 0;
                if (object.catalog != null)
                    message.catalog = object.catalog >>> 0;
                if (object.material != null)
                    message.material = String(object.material);
                if (object.type != null)
                    message.type = object.type >>> 0;
                if (object.swapuv != null)
                    message.swapuv = Boolean(object.swapuv);
                if (object.position) {
                    if (!Array.isArray(object.position))
                        throw TypeError(".pb.Geometry.Grid.position: array expected");
                    message.position = [];
                    for (var i = 0; i < object.position.length; ++i)
                        message.position[i] = Number(object.position[i]);
                }
                if (object.normal) {
                    if (!Array.isArray(object.normal))
                        throw TypeError(".pb.Geometry.Grid.normal: array expected");
                    message.normal = [];
                    for (var i = 0; i < object.normal.length; ++i)
                        message.normal[i] = Number(object.normal[i]);
                }
                if (object.texture) {
                    if (!Array.isArray(object.texture))
                        throw TypeError(".pb.Geometry.Grid.texture: array expected");
                    message.texture = [];
                    for (var i = 0; i < object.texture.length; ++i)
                        message.texture[i] = Number(object.texture[i]);
                }
                if (object.index) {
                    if (!Array.isArray(object.index))
                        throw TypeError(".pb.Geometry.Grid.index: array expected");
                    message.index = [];
                    for (var i = 0; i < object.index.length; ++i)
                        message.index[i] = object.index[i] >>> 0;
                }
                if (object.draco != null)
                    if (typeof object.draco === "string")
                        $util.base64.decode(object.draco, message.draco = $util.newBuffer($util.base64.length(object.draco)), 0);
                    else if (object.draco.length)
                        message.draco = object.draco;
                if (object.size) {
                    if (!Array.isArray(object.size))
                        throw TypeError(".pb.Geometry.Grid.size: array expected");
                    message.size = [];
                    for (var i = 0; i < object.size.length; ++i)
                        message.size[i] = Number(object.size[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from a Grid message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Geometry.Grid
             * @static
             * @param {pb.Geometry.Grid} message Grid
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Grid.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.position = [];
                    object.normal = [];
                    object.texture = [];
                    object.index = [];
                    object.size = [];
                }
                if (options.defaults) {
                    object.name = 0;
                    object.material = "";
                    object.type = 0;
                    object.catalog = 0;
                    object.swapuv = false;
                    if (options.bytes === String)
                        object.draco = "";
                    else {
                        object.draco = [];
                        if (options.bytes !== Array)
                            object.draco = $util.newBuffer(object.draco);
                    }
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.material != null && message.hasOwnProperty("material"))
                    object.material = message.material;
                if (message.position && message.position.length) {
                    object.position = [];
                    for (var j = 0; j < message.position.length; ++j)
                        object.position[j] = options.json && !isFinite(message.position[j]) ? String(message.position[j]) : message.position[j];
                }
                if (message.normal && message.normal.length) {
                    object.normal = [];
                    for (var j = 0; j < message.normal.length; ++j)
                        object.normal[j] = options.json && !isFinite(message.normal[j]) ? String(message.normal[j]) : message.normal[j];
                }
                if (message.texture && message.texture.length) {
                    object.texture = [];
                    for (var j = 0; j < message.texture.length; ++j)
                        object.texture[j] = options.json && !isFinite(message.texture[j]) ? String(message.texture[j]) : message.texture[j];
                }
                if (message.index && message.index.length) {
                    object.index = [];
                    for (var j = 0; j < message.index.length; ++j)
                        object.index[j] = message.index[j];
                }
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = message.type;
                if (message.catalog != null && message.hasOwnProperty("catalog"))
                    object.catalog = message.catalog;
                if (message.swapuv != null && message.hasOwnProperty("swapuv"))
                    object.swapuv = message.swapuv;
                if (message.draco != null && message.hasOwnProperty("draco"))
                    object.draco = options.bytes === String ? $util.base64.encode(message.draco, 0, message.draco.length) : options.bytes === Array ? Array.prototype.slice.call(message.draco) : message.draco;
                if (message.size && message.size.length) {
                    object.size = [];
                    for (var j = 0; j < message.size.length; ++j)
                        object.size[j] = options.json && !isFinite(message.size[j]) ? String(message.size[j]) : message.size[j];
                }
                return object;
            };

            /**
             * Converts this Grid to JSON.
             * @function toJSON
             * @memberof pb.Geometry.Grid
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Grid.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Grid;
        })();

        Geometry.Edge = (function() {

            /**
             * Properties of an Edge.
             * @memberof pb.Geometry
             * @interface IEdge
             * @property {Array.<number>|null} [position] Edge position
             */

            /**
             * Constructs a new Edge.
             * @memberof pb.Geometry
             * @classdesc Represents an Edge.
             * @implements IEdge
             * @constructor
             * @param {pb.Geometry.IEdge=} [properties] Properties to set
             */
            function Edge(properties) {
                this.position = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Edge position.
             * @member {Array.<number>} position
             * @memberof pb.Geometry.Edge
             * @instance
             */
            Edge.prototype.position = $util.emptyArray;

            /**
             * Creates a new Edge instance using the specified properties.
             * @function create
             * @memberof pb.Geometry.Edge
             * @static
             * @param {pb.Geometry.IEdge=} [properties] Properties to set
             * @returns {pb.Geometry.Edge} Edge instance
             */
            Edge.create = function create(properties) {
                return new Edge(properties);
            };

            /**
             * Encodes the specified Edge message. Does not implicitly {@link pb.Geometry.Edge.verify|verify} messages.
             * @function encode
             * @memberof pb.Geometry.Edge
             * @static
             * @param {pb.Geometry.IEdge} message Edge message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Edge.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.position != null && message.position.length) {
                    writer.uint32(/* id 1, wireType 2 =*/10).fork();
                    for (var i = 0; i < message.position.length; ++i)
                        writer.float(message.position[i]);
                    writer.ldelim();
                }
                return writer;
            };

            /**
             * Encodes the specified Edge message, length delimited. Does not implicitly {@link pb.Geometry.Edge.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Geometry.Edge
             * @static
             * @param {pb.Geometry.IEdge} message Edge message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Edge.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Edge message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Geometry.Edge
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Geometry.Edge} Edge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Edge.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Geometry.Edge();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.position && message.position.length))
                            message.position = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.position.push(reader.float());
                        } else
                            message.position.push(reader.float());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Edge message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Geometry.Edge
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Geometry.Edge} Edge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Edge.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Edge message.
             * @function verify
             * @memberof pb.Geometry.Edge
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Edge.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.position != null && message.hasOwnProperty("position")) {
                    if (!Array.isArray(message.position))
                        return "position: array expected";
                    for (var i = 0; i < message.position.length; ++i)
                        if (typeof message.position[i] !== "number")
                            return "position: number[] expected";
                }
                return null;
            };

            /**
             * Creates an Edge message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Geometry.Edge
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Geometry.Edge} Edge
             */
            Edge.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Geometry.Edge)
                    return object;
                var message = new $root.pb.Geometry.Edge();
                if (object.position) {
                    if (!Array.isArray(object.position))
                        throw TypeError(".pb.Geometry.Edge.position: array expected");
                    message.position = [];
                    for (var i = 0; i < object.position.length; ++i)
                        message.position[i] = Number(object.position[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from an Edge message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Geometry.Edge
             * @static
             * @param {pb.Geometry.Edge} message Edge
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Edge.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.position = [];
                if (message.position && message.position.length) {
                    object.position = [];
                    for (var j = 0; j < message.position.length; ++j)
                        object.position[j] = options.json && !isFinite(message.position[j]) ? String(message.position[j]) : message.position[j];
                }
                return object;
            };

            /**
             * Converts this Edge to JSON.
             * @function toJSON
             * @memberof pb.Geometry.Edge
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Edge.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Edge;
        })();

        return Geometry;
    })();

    pb.Edges = (function() {

        /**
         * Properties of an Edges.
         * @memberof pb
         * @interface IEdges
         * @property {Array.<pb.Edges.IEdge>|null} [edge] Edges edge
         */

        /**
         * Constructs a new Edges.
         * @memberof pb
         * @classdesc Represents an Edges.
         * @implements IEdges
         * @constructor
         * @param {pb.IEdges=} [properties] Properties to set
         */
        function Edges(properties) {
            this.edge = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Edges edge.
         * @member {Array.<pb.Edges.IEdge>} edge
         * @memberof pb.Edges
         * @instance
         */
        Edges.prototype.edge = $util.emptyArray;

        /**
         * Creates a new Edges instance using the specified properties.
         * @function create
         * @memberof pb.Edges
         * @static
         * @param {pb.IEdges=} [properties] Properties to set
         * @returns {pb.Edges} Edges instance
         */
        Edges.create = function create(properties) {
            return new Edges(properties);
        };

        /**
         * Encodes the specified Edges message. Does not implicitly {@link pb.Edges.verify|verify} messages.
         * @function encode
         * @memberof pb.Edges
         * @static
         * @param {pb.IEdges} message Edges message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Edges.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.edge != null && message.edge.length)
                for (var i = 0; i < message.edge.length; ++i)
                    $root.pb.Edges.Edge.encode(message.edge[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Edges message, length delimited. Does not implicitly {@link pb.Edges.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Edges
         * @static
         * @param {pb.IEdges} message Edges message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Edges.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Edges message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Edges
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Edges} Edges
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Edges.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Edges();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.edge && message.edge.length))
                        message.edge = [];
                    message.edge.push($root.pb.Edges.Edge.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Edges message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Edges
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Edges} Edges
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Edges.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Edges message.
         * @function verify
         * @memberof pb.Edges
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Edges.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.edge != null && message.hasOwnProperty("edge")) {
                if (!Array.isArray(message.edge))
                    return "edge: array expected";
                for (var i = 0; i < message.edge.length; ++i) {
                    var error = $root.pb.Edges.Edge.verify(message.edge[i]);
                    if (error)
                        return "edge." + error;
                }
            }
            return null;
        };

        /**
         * Creates an Edges message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Edges
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Edges} Edges
         */
        Edges.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Edges)
                return object;
            var message = new $root.pb.Edges();
            if (object.edge) {
                if (!Array.isArray(object.edge))
                    throw TypeError(".pb.Edges.edge: array expected");
                message.edge = [];
                for (var i = 0; i < object.edge.length; ++i) {
                    if (typeof object.edge[i] !== "object")
                        throw TypeError(".pb.Edges.edge: object expected");
                    message.edge[i] = $root.pb.Edges.Edge.fromObject(object.edge[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an Edges message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Edges
         * @static
         * @param {pb.Edges} message Edges
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Edges.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.edge = [];
            if (message.edge && message.edge.length) {
                object.edge = [];
                for (var j = 0; j < message.edge.length; ++j)
                    object.edge[j] = $root.pb.Edges.Edge.toObject(message.edge[j], options);
            }
            return object;
        };

        /**
         * Converts this Edges to JSON.
         * @function toJSON
         * @memberof pb.Edges
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Edges.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Edges.Edge = (function() {

            /**
             * Properties of an Edge.
             * @memberof pb.Edges
             * @interface IEdge
             * @property {Array.<number>|null} [position] Edge position
             */

            /**
             * Constructs a new Edge.
             * @memberof pb.Edges
             * @classdesc Represents an Edge.
             * @implements IEdge
             * @constructor
             * @param {pb.Edges.IEdge=} [properties] Properties to set
             */
            function Edge(properties) {
                this.position = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Edge position.
             * @member {Array.<number>} position
             * @memberof pb.Edges.Edge
             * @instance
             */
            Edge.prototype.position = $util.emptyArray;

            /**
             * Creates a new Edge instance using the specified properties.
             * @function create
             * @memberof pb.Edges.Edge
             * @static
             * @param {pb.Edges.IEdge=} [properties] Properties to set
             * @returns {pb.Edges.Edge} Edge instance
             */
            Edge.create = function create(properties) {
                return new Edge(properties);
            };

            /**
             * Encodes the specified Edge message. Does not implicitly {@link pb.Edges.Edge.verify|verify} messages.
             * @function encode
             * @memberof pb.Edges.Edge
             * @static
             * @param {pb.Edges.IEdge} message Edge message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Edge.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.position != null && message.position.length) {
                    writer.uint32(/* id 1, wireType 2 =*/10).fork();
                    for (var i = 0; i < message.position.length; ++i)
                        writer.float(message.position[i]);
                    writer.ldelim();
                }
                return writer;
            };

            /**
             * Encodes the specified Edge message, length delimited. Does not implicitly {@link pb.Edges.Edge.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Edges.Edge
             * @static
             * @param {pb.Edges.IEdge} message Edge message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Edge.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Edge message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Edges.Edge
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Edges.Edge} Edge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Edge.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Edges.Edge();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.position && message.position.length))
                            message.position = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.position.push(reader.float());
                        } else
                            message.position.push(reader.float());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Edge message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Edges.Edge
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Edges.Edge} Edge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Edge.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Edge message.
             * @function verify
             * @memberof pb.Edges.Edge
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Edge.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.position != null && message.hasOwnProperty("position")) {
                    if (!Array.isArray(message.position))
                        return "position: array expected";
                    for (var i = 0; i < message.position.length; ++i)
                        if (typeof message.position[i] !== "number")
                            return "position: number[] expected";
                }
                return null;
            };

            /**
             * Creates an Edge message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Edges.Edge
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Edges.Edge} Edge
             */
            Edge.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Edges.Edge)
                    return object;
                var message = new $root.pb.Edges.Edge();
                if (object.position) {
                    if (!Array.isArray(object.position))
                        throw TypeError(".pb.Edges.Edge.position: array expected");
                    message.position = [];
                    for (var i = 0; i < object.position.length; ++i)
                        message.position[i] = Number(object.position[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from an Edge message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Edges.Edge
             * @static
             * @param {pb.Edges.Edge} message Edge
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Edge.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.position = [];
                if (message.position && message.position.length) {
                    object.position = [];
                    for (var j = 0; j < message.position.length; ++j)
                        object.position[j] = options.json && !isFinite(message.position[j]) ? String(message.position[j]) : message.position[j];
                }
                return object;
            };

            /**
             * Converts this Edge to JSON.
             * @function toJSON
             * @memberof pb.Edges.Edge
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Edge.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Edge;
        })();

        return Edges;
    })();

    pb.Animation = (function() {

        /**
         * Properties of an Animation.
         * @memberof pb
         * @interface IAnimation
         * @property {string|null} [entity] Animation entity
         * @property {Array.<pb.Animation.IFrame>|null} [frame] Animation frame
         */

        /**
         * Constructs a new Animation.
         * @memberof pb
         * @classdesc Represents an Animation.
         * @implements IAnimation
         * @constructor
         * @param {pb.IAnimation=} [properties] Properties to set
         */
        function Animation(properties) {
            this.frame = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Animation entity.
         * @member {string} entity
         * @memberof pb.Animation
         * @instance
         */
        Animation.prototype.entity = "";

        /**
         * Animation frame.
         * @member {Array.<pb.Animation.IFrame>} frame
         * @memberof pb.Animation
         * @instance
         */
        Animation.prototype.frame = $util.emptyArray;

        /**
         * Creates a new Animation instance using the specified properties.
         * @function create
         * @memberof pb.Animation
         * @static
         * @param {pb.IAnimation=} [properties] Properties to set
         * @returns {pb.Animation} Animation instance
         */
        Animation.create = function create(properties) {
            return new Animation(properties);
        };

        /**
         * Encodes the specified Animation message. Does not implicitly {@link pb.Animation.verify|verify} messages.
         * @function encode
         * @memberof pb.Animation
         * @static
         * @param {pb.IAnimation} message Animation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Animation.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.entity != null && message.hasOwnProperty("entity"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.entity);
            if (message.frame != null && message.frame.length)
                for (var i = 0; i < message.frame.length; ++i)
                    $root.pb.Animation.Frame.encode(message.frame[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Animation message, length delimited. Does not implicitly {@link pb.Animation.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Animation
         * @static
         * @param {pb.IAnimation} message Animation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Animation.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Animation message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Animation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Animation} Animation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Animation.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Animation();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.entity = reader.string();
                    break;
                case 2:
                    if (!(message.frame && message.frame.length))
                        message.frame = [];
                    message.frame.push($root.pb.Animation.Frame.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Animation message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Animation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Animation} Animation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Animation.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Animation message.
         * @function verify
         * @memberof pb.Animation
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Animation.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.entity != null && message.hasOwnProperty("entity"))
                if (!$util.isString(message.entity))
                    return "entity: string expected";
            if (message.frame != null && message.hasOwnProperty("frame")) {
                if (!Array.isArray(message.frame))
                    return "frame: array expected";
                for (var i = 0; i < message.frame.length; ++i) {
                    var error = $root.pb.Animation.Frame.verify(message.frame[i]);
                    if (error)
                        return "frame." + error;
                }
            }
            return null;
        };

        /**
         * Creates an Animation message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Animation
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Animation} Animation
         */
        Animation.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Animation)
                return object;
            var message = new $root.pb.Animation();
            if (object.entity != null)
                message.entity = String(object.entity);
            if (object.frame) {
                if (!Array.isArray(object.frame))
                    throw TypeError(".pb.Animation.frame: array expected");
                message.frame = [];
                for (var i = 0; i < object.frame.length; ++i) {
                    if (typeof object.frame[i] !== "object")
                        throw TypeError(".pb.Animation.frame: object expected");
                    message.frame[i] = $root.pb.Animation.Frame.fromObject(object.frame[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an Animation message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Animation
         * @static
         * @param {pb.Animation} message Animation
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Animation.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.frame = [];
            if (options.defaults)
                object.entity = "";
            if (message.entity != null && message.hasOwnProperty("entity"))
                object.entity = message.entity;
            if (message.frame && message.frame.length) {
                object.frame = [];
                for (var j = 0; j < message.frame.length; ++j)
                    object.frame[j] = $root.pb.Animation.Frame.toObject(message.frame[j], options);
            }
            return object;
        };

        /**
         * Converts this Animation to JSON.
         * @function toJSON
         * @memberof pb.Animation
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Animation.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Animation.Frame = (function() {

            /**
             * Properties of a Frame.
             * @memberof pb.Animation
             * @interface IFrame
             * @property {Array.<number>|null} [move] Frame move
             * @property {Array.<number>|null} [axis] Frame axis
             * @property {number|null} [angle] Frame angle
             * @property {number|null} [length] Frame length
             */

            /**
             * Constructs a new Frame.
             * @memberof pb.Animation
             * @classdesc Represents a Frame.
             * @implements IFrame
             * @constructor
             * @param {pb.Animation.IFrame=} [properties] Properties to set
             */
            function Frame(properties) {
                this.move = [];
                this.axis = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Frame move.
             * @member {Array.<number>} move
             * @memberof pb.Animation.Frame
             * @instance
             */
            Frame.prototype.move = $util.emptyArray;

            /**
             * Frame axis.
             * @member {Array.<number>} axis
             * @memberof pb.Animation.Frame
             * @instance
             */
            Frame.prototype.axis = $util.emptyArray;

            /**
             * Frame angle.
             * @member {number} angle
             * @memberof pb.Animation.Frame
             * @instance
             */
            Frame.prototype.angle = 0;

            /**
             * Frame length.
             * @member {number} length
             * @memberof pb.Animation.Frame
             * @instance
             */
            Frame.prototype.length = 0;

            /**
             * Creates a new Frame instance using the specified properties.
             * @function create
             * @memberof pb.Animation.Frame
             * @static
             * @param {pb.Animation.IFrame=} [properties] Properties to set
             * @returns {pb.Animation.Frame} Frame instance
             */
            Frame.create = function create(properties) {
                return new Frame(properties);
            };

            /**
             * Encodes the specified Frame message. Does not implicitly {@link pb.Animation.Frame.verify|verify} messages.
             * @function encode
             * @memberof pb.Animation.Frame
             * @static
             * @param {pb.Animation.IFrame} message Frame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Frame.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.move != null && message.move.length) {
                    writer.uint32(/* id 1, wireType 2 =*/10).fork();
                    for (var i = 0; i < message.move.length; ++i)
                        writer.float(message.move[i]);
                    writer.ldelim();
                }
                if (message.axis != null && message.axis.length) {
                    writer.uint32(/* id 2, wireType 2 =*/18).fork();
                    for (var i = 0; i < message.axis.length; ++i)
                        writer.float(message.axis[i]);
                    writer.ldelim();
                }
                if (message.angle != null && message.hasOwnProperty("angle"))
                    writer.uint32(/* id 3, wireType 5 =*/29).float(message.angle);
                if (message.length != null && message.hasOwnProperty("length"))
                    writer.uint32(/* id 4, wireType 5 =*/37).float(message.length);
                return writer;
            };

            /**
             * Encodes the specified Frame message, length delimited. Does not implicitly {@link pb.Animation.Frame.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Animation.Frame
             * @static
             * @param {pb.Animation.IFrame} message Frame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Frame.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Frame message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Animation.Frame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Animation.Frame} Frame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Frame.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Animation.Frame();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.move && message.move.length))
                            message.move = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.move.push(reader.float());
                        } else
                            message.move.push(reader.float());
                        break;
                    case 2:
                        if (!(message.axis && message.axis.length))
                            message.axis = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.axis.push(reader.float());
                        } else
                            message.axis.push(reader.float());
                        break;
                    case 3:
                        message.angle = reader.float();
                        break;
                    case 4:
                        message.length = reader.float();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Frame message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Animation.Frame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Animation.Frame} Frame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Frame.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Frame message.
             * @function verify
             * @memberof pb.Animation.Frame
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Frame.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.move != null && message.hasOwnProperty("move")) {
                    if (!Array.isArray(message.move))
                        return "move: array expected";
                    for (var i = 0; i < message.move.length; ++i)
                        if (typeof message.move[i] !== "number")
                            return "move: number[] expected";
                }
                if (message.axis != null && message.hasOwnProperty("axis")) {
                    if (!Array.isArray(message.axis))
                        return "axis: array expected";
                    for (var i = 0; i < message.axis.length; ++i)
                        if (typeof message.axis[i] !== "number")
                            return "axis: number[] expected";
                }
                if (message.angle != null && message.hasOwnProperty("angle"))
                    if (typeof message.angle !== "number")
                        return "angle: number expected";
                if (message.length != null && message.hasOwnProperty("length"))
                    if (typeof message.length !== "number")
                        return "length: number expected";
                return null;
            };

            /**
             * Creates a Frame message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Animation.Frame
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Animation.Frame} Frame
             */
            Frame.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Animation.Frame)
                    return object;
                var message = new $root.pb.Animation.Frame();
                if (object.move) {
                    if (!Array.isArray(object.move))
                        throw TypeError(".pb.Animation.Frame.move: array expected");
                    message.move = [];
                    for (var i = 0; i < object.move.length; ++i)
                        message.move[i] = Number(object.move[i]);
                }
                if (object.axis) {
                    if (!Array.isArray(object.axis))
                        throw TypeError(".pb.Animation.Frame.axis: array expected");
                    message.axis = [];
                    for (var i = 0; i < object.axis.length; ++i)
                        message.axis[i] = Number(object.axis[i]);
                }
                if (object.angle != null)
                    message.angle = Number(object.angle);
                if (object.length != null)
                    message.length = Number(object.length);
                return message;
            };

            /**
             * Creates a plain object from a Frame message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Animation.Frame
             * @static
             * @param {pb.Animation.Frame} message Frame
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Frame.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.move = [];
                    object.axis = [];
                }
                if (options.defaults) {
                    object.angle = 0;
                    object.length = 0;
                }
                if (message.move && message.move.length) {
                    object.move = [];
                    for (var j = 0; j < message.move.length; ++j)
                        object.move[j] = options.json && !isFinite(message.move[j]) ? String(message.move[j]) : message.move[j];
                }
                if (message.axis && message.axis.length) {
                    object.axis = [];
                    for (var j = 0; j < message.axis.length; ++j)
                        object.axis[j] = options.json && !isFinite(message.axis[j]) ? String(message.axis[j]) : message.axis[j];
                }
                if (message.angle != null && message.hasOwnProperty("angle"))
                    object.angle = options.json && !isFinite(message.angle) ? String(message.angle) : message.angle;
                if (message.length != null && message.hasOwnProperty("length"))
                    object.length = options.json && !isFinite(message.length) ? String(message.length) : message.length;
                return object;
            };

            /**
             * Converts this Frame to JSON.
             * @function toJSON
             * @memberof pb.Animation.Frame
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Frame.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Frame;
        })();

        return Animation;
    })();

    pb.CompoundAnimation = (function() {

        /**
         * Properties of a CompoundAnimation.
         * @memberof pb
         * @interface ICompoundAnimation
         * @property {Array.<pb.IAnimation>|null} [item] CompoundAnimation item
         * @property {number|null} [length] CompoundAnimation length
         */

        /**
         * Constructs a new CompoundAnimation.
         * @memberof pb
         * @classdesc Represents a CompoundAnimation.
         * @implements ICompoundAnimation
         * @constructor
         * @param {pb.ICompoundAnimation=} [properties] Properties to set
         */
        function CompoundAnimation(properties) {
            this.item = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CompoundAnimation item.
         * @member {Array.<pb.IAnimation>} item
         * @memberof pb.CompoundAnimation
         * @instance
         */
        CompoundAnimation.prototype.item = $util.emptyArray;

        /**
         * CompoundAnimation length.
         * @member {number} length
         * @memberof pb.CompoundAnimation
         * @instance
         */
        CompoundAnimation.prototype.length = 0;

        /**
         * Creates a new CompoundAnimation instance using the specified properties.
         * @function create
         * @memberof pb.CompoundAnimation
         * @static
         * @param {pb.ICompoundAnimation=} [properties] Properties to set
         * @returns {pb.CompoundAnimation} CompoundAnimation instance
         */
        CompoundAnimation.create = function create(properties) {
            return new CompoundAnimation(properties);
        };

        /**
         * Encodes the specified CompoundAnimation message. Does not implicitly {@link pb.CompoundAnimation.verify|verify} messages.
         * @function encode
         * @memberof pb.CompoundAnimation
         * @static
         * @param {pb.ICompoundAnimation} message CompoundAnimation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CompoundAnimation.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.item != null && message.item.length)
                for (var i = 0; i < message.item.length; ++i)
                    $root.pb.Animation.encode(message.item[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.length != null && message.hasOwnProperty("length"))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.length);
            return writer;
        };

        /**
         * Encodes the specified CompoundAnimation message, length delimited. Does not implicitly {@link pb.CompoundAnimation.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.CompoundAnimation
         * @static
         * @param {pb.ICompoundAnimation} message CompoundAnimation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CompoundAnimation.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CompoundAnimation message from the specified reader or buffer.
         * @function decode
         * @memberof pb.CompoundAnimation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.CompoundAnimation} CompoundAnimation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CompoundAnimation.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.CompoundAnimation();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.item && message.item.length))
                        message.item = [];
                    message.item.push($root.pb.Animation.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.length = reader.float();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CompoundAnimation message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.CompoundAnimation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.CompoundAnimation} CompoundAnimation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CompoundAnimation.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CompoundAnimation message.
         * @function verify
         * @memberof pb.CompoundAnimation
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CompoundAnimation.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.item != null && message.hasOwnProperty("item")) {
                if (!Array.isArray(message.item))
                    return "item: array expected";
                for (var i = 0; i < message.item.length; ++i) {
                    var error = $root.pb.Animation.verify(message.item[i]);
                    if (error)
                        return "item." + error;
                }
            }
            if (message.length != null && message.hasOwnProperty("length"))
                if (typeof message.length !== "number")
                    return "length: number expected";
            return null;
        };

        /**
         * Creates a CompoundAnimation message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.CompoundAnimation
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.CompoundAnimation} CompoundAnimation
         */
        CompoundAnimation.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.CompoundAnimation)
                return object;
            var message = new $root.pb.CompoundAnimation();
            if (object.item) {
                if (!Array.isArray(object.item))
                    throw TypeError(".pb.CompoundAnimation.item: array expected");
                message.item = [];
                for (var i = 0; i < object.item.length; ++i) {
                    if (typeof object.item[i] !== "object")
                        throw TypeError(".pb.CompoundAnimation.item: object expected");
                    message.item[i] = $root.pb.Animation.fromObject(object.item[i]);
                }
            }
            if (object.length != null)
                message.length = Number(object.length);
            return message;
        };

        /**
         * Creates a plain object from a CompoundAnimation message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.CompoundAnimation
         * @static
         * @param {pb.CompoundAnimation} message CompoundAnimation
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CompoundAnimation.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.item = [];
            if (options.defaults)
                object.length = 0;
            if (message.item && message.item.length) {
                object.item = [];
                for (var j = 0; j < message.item.length; ++j)
                    object.item[j] = $root.pb.Animation.toObject(message.item[j], options);
            }
            if (message.length != null && message.hasOwnProperty("length"))
                object.length = options.json && !isFinite(message.length) ? String(message.length) : message.length;
            return object;
        };

        /**
         * Converts this CompoundAnimation to JSON.
         * @function toJSON
         * @memberof pb.CompoundAnimation
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CompoundAnimation.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return CompoundAnimation;
    })();

    pb.Elastic = (function() {

        /**
         * Properties of an Elastic.
         * @memberof pb
         * @interface IElastic
         * @property {Array.<number>|null} [size] Elastic size
         * @property {boolean|null} [x] Elastic x
         * @property {boolean|null} [y] Elastic y
         * @property {boolean|null} [z] Elastic z
         * @property {boolean|null} [container] Elastic container
         * @property {pb.Elastic.Position|null} [position] Elastic position
         * @property {Array.<pb.Elastic.IParam>|null} [param] Elastic param
         * @property {Array.<number>|null} [min] Elastic min
         * @property {Array.<number>|null} [max] Elastic max
         */

        /**
         * Constructs a new Elastic.
         * @memberof pb
         * @classdesc Represents an Elastic.
         * @implements IElastic
         * @constructor
         * @param {pb.IElastic=} [properties] Properties to set
         */
        function Elastic(properties) {
            this.size = [];
            this.param = [];
            this.min = [];
            this.max = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Elastic size.
         * @member {Array.<number>} size
         * @memberof pb.Elastic
         * @instance
         */
        Elastic.prototype.size = $util.emptyArray;

        /**
         * Elastic x.
         * @member {boolean} x
         * @memberof pb.Elastic
         * @instance
         */
        Elastic.prototype.x = false;

        /**
         * Elastic y.
         * @member {boolean} y
         * @memberof pb.Elastic
         * @instance
         */
        Elastic.prototype.y = false;

        /**
         * Elastic z.
         * @member {boolean} z
         * @memberof pb.Elastic
         * @instance
         */
        Elastic.prototype.z = false;

        /**
         * Elastic container.
         * @member {boolean} container
         * @memberof pb.Elastic
         * @instance
         */
        Elastic.prototype.container = false;

        /**
         * Elastic position.
         * @member {pb.Elastic.Position} position
         * @memberof pb.Elastic
         * @instance
         */
        Elastic.prototype.position = 0;

        /**
         * Elastic param.
         * @member {Array.<pb.Elastic.IParam>} param
         * @memberof pb.Elastic
         * @instance
         */
        Elastic.prototype.param = $util.emptyArray;

        /**
         * Elastic min.
         * @member {Array.<number>} min
         * @memberof pb.Elastic
         * @instance
         */
        Elastic.prototype.min = $util.emptyArray;

        /**
         * Elastic max.
         * @member {Array.<number>} max
         * @memberof pb.Elastic
         * @instance
         */
        Elastic.prototype.max = $util.emptyArray;

        /**
         * Creates a new Elastic instance using the specified properties.
         * @function create
         * @memberof pb.Elastic
         * @static
         * @param {pb.IElastic=} [properties] Properties to set
         * @returns {pb.Elastic} Elastic instance
         */
        Elastic.create = function create(properties) {
            return new Elastic(properties);
        };

        /**
         * Encodes the specified Elastic message. Does not implicitly {@link pb.Elastic.verify|verify} messages.
         * @function encode
         * @memberof pb.Elastic
         * @static
         * @param {pb.IElastic} message Elastic message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Elastic.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.size != null && message.size.length) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork();
                for (var i = 0; i < message.size.length; ++i)
                    writer.double(message.size[i]);
                writer.ldelim();
            }
            if (message.x != null && message.hasOwnProperty("x"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.x);
            if (message.y != null && message.hasOwnProperty("y"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.y);
            if (message.z != null && message.hasOwnProperty("z"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.z);
            if (message.container != null && message.hasOwnProperty("container"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.container);
            if (message.position != null && message.hasOwnProperty("position"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.position);
            if (message.param != null && message.param.length)
                for (var i = 0; i < message.param.length; ++i)
                    $root.pb.Elastic.Param.encode(message.param[i], writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.min != null && message.min.length) {
                writer.uint32(/* id 8, wireType 2 =*/66).fork();
                for (var i = 0; i < message.min.length; ++i)
                    writer.double(message.min[i]);
                writer.ldelim();
            }
            if (message.max != null && message.max.length) {
                writer.uint32(/* id 9, wireType 2 =*/74).fork();
                for (var i = 0; i < message.max.length; ++i)
                    writer.double(message.max[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified Elastic message, length delimited. Does not implicitly {@link pb.Elastic.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Elastic
         * @static
         * @param {pb.IElastic} message Elastic message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Elastic.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Elastic message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Elastic
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Elastic} Elastic
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Elastic.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Elastic();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.size && message.size.length))
                        message.size = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.size.push(reader.double());
                    } else
                        message.size.push(reader.double());
                    break;
                case 2:
                    message.x = reader.bool();
                    break;
                case 3:
                    message.y = reader.bool();
                    break;
                case 4:
                    message.z = reader.bool();
                    break;
                case 5:
                    message.container = reader.bool();
                    break;
                case 6:
                    message.position = reader.int32();
                    break;
                case 7:
                    if (!(message.param && message.param.length))
                        message.param = [];
                    message.param.push($root.pb.Elastic.Param.decode(reader, reader.uint32()));
                    break;
                case 8:
                    if (!(message.min && message.min.length))
                        message.min = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.min.push(reader.double());
                    } else
                        message.min.push(reader.double());
                    break;
                case 9:
                    if (!(message.max && message.max.length))
                        message.max = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.max.push(reader.double());
                    } else
                        message.max.push(reader.double());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Elastic message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Elastic
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Elastic} Elastic
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Elastic.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Elastic message.
         * @function verify
         * @memberof pb.Elastic
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Elastic.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.size != null && message.hasOwnProperty("size")) {
                if (!Array.isArray(message.size))
                    return "size: array expected";
                for (var i = 0; i < message.size.length; ++i)
                    if (typeof message.size[i] !== "number")
                        return "size: number[] expected";
            }
            if (message.x != null && message.hasOwnProperty("x"))
                if (typeof message.x !== "boolean")
                    return "x: boolean expected";
            if (message.y != null && message.hasOwnProperty("y"))
                if (typeof message.y !== "boolean")
                    return "y: boolean expected";
            if (message.z != null && message.hasOwnProperty("z"))
                if (typeof message.z !== "boolean")
                    return "z: boolean expected";
            if (message.container != null && message.hasOwnProperty("container"))
                if (typeof message.container !== "boolean")
                    return "container: boolean expected";
            if (message.position != null && message.hasOwnProperty("position"))
                switch (message.position) {
                default:
                    return "position: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                    break;
                }
            if (message.param != null && message.hasOwnProperty("param")) {
                if (!Array.isArray(message.param))
                    return "param: array expected";
                for (var i = 0; i < message.param.length; ++i) {
                    var error = $root.pb.Elastic.Param.verify(message.param[i]);
                    if (error)
                        return "param." + error;
                }
            }
            if (message.min != null && message.hasOwnProperty("min")) {
                if (!Array.isArray(message.min))
                    return "min: array expected";
                for (var i = 0; i < message.min.length; ++i)
                    if (typeof message.min[i] !== "number")
                        return "min: number[] expected";
            }
            if (message.max != null && message.hasOwnProperty("max")) {
                if (!Array.isArray(message.max))
                    return "max: array expected";
                for (var i = 0; i < message.max.length; ++i)
                    if (typeof message.max[i] !== "number")
                        return "max: number[] expected";
            }
            return null;
        };

        /**
         * Creates an Elastic message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Elastic
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Elastic} Elastic
         */
        Elastic.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Elastic)
                return object;
            var message = new $root.pb.Elastic();
            if (object.size) {
                if (!Array.isArray(object.size))
                    throw TypeError(".pb.Elastic.size: array expected");
                message.size = [];
                for (var i = 0; i < object.size.length; ++i)
                    message.size[i] = Number(object.size[i]);
            }
            if (object.x != null)
                message.x = Boolean(object.x);
            if (object.y != null)
                message.y = Boolean(object.y);
            if (object.z != null)
                message.z = Boolean(object.z);
            if (object.container != null)
                message.container = Boolean(object.container);
            switch (object.position) {
            case "None":
            case 0:
                message.position = 0;
                break;
            case "Fill":
            case 1:
                message.position = 1;
                break;
            case "Left":
            case 2:
                message.position = 2;
                break;
            case "Right":
            case 3:
                message.position = 3;
                break;
            case "Bottom":
            case 4:
                message.position = 4;
                break;
            case "Top":
            case 5:
                message.position = 5;
                break;
            case "Back":
            case 6:
                message.position = 6;
                break;
            case "Front":
            case 7:
                message.position = 7;
                break;
            case "Vertical":
            case 8:
                message.position = 8;
                break;
            case "Horizontal":
            case 9:
                message.position = 9;
                break;
            case "Frontal":
            case 10:
                message.position = 10;
                break;
            case "VSplitter":
            case 11:
                message.position = 11;
                break;
            case "HSplitter":
            case 12:
                message.position = 12;
                break;
            case "FSplitter":
            case 13:
                message.position = 13;
                break;
            case "LeftRight":
            case 14:
                message.position = 14;
                break;
            case "TopBottom":
            case 15:
                message.position = 15;
                break;
            }
            if (object.param) {
                if (!Array.isArray(object.param))
                    throw TypeError(".pb.Elastic.param: array expected");
                message.param = [];
                for (var i = 0; i < object.param.length; ++i) {
                    if (typeof object.param[i] !== "object")
                        throw TypeError(".pb.Elastic.param: object expected");
                    message.param[i] = $root.pb.Elastic.Param.fromObject(object.param[i]);
                }
            }
            if (object.min) {
                if (!Array.isArray(object.min))
                    throw TypeError(".pb.Elastic.min: array expected");
                message.min = [];
                for (var i = 0; i < object.min.length; ++i)
                    message.min[i] = Number(object.min[i]);
            }
            if (object.max) {
                if (!Array.isArray(object.max))
                    throw TypeError(".pb.Elastic.max: array expected");
                message.max = [];
                for (var i = 0; i < object.max.length; ++i)
                    message.max[i] = Number(object.max[i]);
            }
            return message;
        };

        /**
         * Creates a plain object from an Elastic message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Elastic
         * @static
         * @param {pb.Elastic} message Elastic
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Elastic.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.size = [];
                object.param = [];
                object.min = [];
                object.max = [];
            }
            if (options.defaults) {
                object.x = false;
                object.y = false;
                object.z = false;
                object.container = false;
                object.position = options.enums === String ? "None" : 0;
            }
            if (message.size && message.size.length) {
                object.size = [];
                for (var j = 0; j < message.size.length; ++j)
                    object.size[j] = options.json && !isFinite(message.size[j]) ? String(message.size[j]) : message.size[j];
            }
            if (message.x != null && message.hasOwnProperty("x"))
                object.x = message.x;
            if (message.y != null && message.hasOwnProperty("y"))
                object.y = message.y;
            if (message.z != null && message.hasOwnProperty("z"))
                object.z = message.z;
            if (message.container != null && message.hasOwnProperty("container"))
                object.container = message.container;
            if (message.position != null && message.hasOwnProperty("position"))
                object.position = options.enums === String ? $root.pb.Elastic.Position[message.position] : message.position;
            if (message.param && message.param.length) {
                object.param = [];
                for (var j = 0; j < message.param.length; ++j)
                    object.param[j] = $root.pb.Elastic.Param.toObject(message.param[j], options);
            }
            if (message.min && message.min.length) {
                object.min = [];
                for (var j = 0; j < message.min.length; ++j)
                    object.min[j] = options.json && !isFinite(message.min[j]) ? String(message.min[j]) : message.min[j];
            }
            if (message.max && message.max.length) {
                object.max = [];
                for (var j = 0; j < message.max.length; ++j)
                    object.max[j] = options.json && !isFinite(message.max[j]) ? String(message.max[j]) : message.max[j];
            }
            return object;
        };

        /**
         * Converts this Elastic to JSON.
         * @function toJSON
         * @memberof pb.Elastic
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Elastic.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Position enum.
         * @name pb.Elastic.Position
         * @enum {string}
         * @property {number} None=0 None value
         * @property {number} Fill=1 Fill value
         * @property {number} Left=2 Left value
         * @property {number} Right=3 Right value
         * @property {number} Bottom=4 Bottom value
         * @property {number} Top=5 Top value
         * @property {number} Back=6 Back value
         * @property {number} Front=7 Front value
         * @property {number} Vertical=8 Vertical value
         * @property {number} Horizontal=9 Horizontal value
         * @property {number} Frontal=10 Frontal value
         * @property {number} VSplitter=11 VSplitter value
         * @property {number} HSplitter=12 HSplitter value
         * @property {number} FSplitter=13 FSplitter value
         * @property {number} LeftRight=14 LeftRight value
         * @property {number} TopBottom=15 TopBottom value
         */
        Elastic.Position = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "None"] = 0;
            values[valuesById[1] = "Fill"] = 1;
            values[valuesById[2] = "Left"] = 2;
            values[valuesById[3] = "Right"] = 3;
            values[valuesById[4] = "Bottom"] = 4;
            values[valuesById[5] = "Top"] = 5;
            values[valuesById[6] = "Back"] = 6;
            values[valuesById[7] = "Front"] = 7;
            values[valuesById[8] = "Vertical"] = 8;
            values[valuesById[9] = "Horizontal"] = 9;
            values[valuesById[10] = "Frontal"] = 10;
            values[valuesById[11] = "VSplitter"] = 11;
            values[valuesById[12] = "HSplitter"] = 12;
            values[valuesById[13] = "FSplitter"] = 13;
            values[valuesById[14] = "LeftRight"] = 14;
            values[valuesById[15] = "TopBottom"] = 15;
            return values;
        })();

        /**
         * ParamFlag enum.
         * @name pb.Elastic.ParamFlag
         * @enum {string}
         * @property {number} Default=0 Default value
         * @property {number} Symmetrical=1 Symmetrical value
         * @property {number} Radial=2 Radial value
         * @property {number} Angular=4 Angular value
         * @property {number} Numerical=8 Numerical value
         * @property {number} Before=16 Before value
         * @property {number} After=32 After value
         */
        Elastic.ParamFlag = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "Default"] = 0;
            values[valuesById[1] = "Symmetrical"] = 1;
            values[valuesById[2] = "Radial"] = 2;
            values[valuesById[4] = "Angular"] = 4;
            values[valuesById[8] = "Numerical"] = 8;
            values[valuesById[16] = "Before"] = 16;
            values[valuesById[32] = "After"] = 32;
            return values;
        })();

        Elastic.Param = (function() {

            /**
             * Properties of a Param.
             * @memberof pb.Elastic
             * @interface IParam
             * @property {string|null} [name] Param name
             * @property {number|null} [size] Param size
             * @property {number|null} [flags] Param flags
             * @property {string|null} [description] Param description
             * @property {string|null} [variants] Param variants
             */

            /**
             * Constructs a new Param.
             * @memberof pb.Elastic
             * @classdesc Represents a Param.
             * @implements IParam
             * @constructor
             * @param {pb.Elastic.IParam=} [properties] Properties to set
             */
            function Param(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Param name.
             * @member {string} name
             * @memberof pb.Elastic.Param
             * @instance
             */
            Param.prototype.name = "";

            /**
             * Param size.
             * @member {number} size
             * @memberof pb.Elastic.Param
             * @instance
             */
            Param.prototype.size = 0;

            /**
             * Param flags.
             * @member {number} flags
             * @memberof pb.Elastic.Param
             * @instance
             */
            Param.prototype.flags = 0;

            /**
             * Param description.
             * @member {string} description
             * @memberof pb.Elastic.Param
             * @instance
             */
            Param.prototype.description = "";

            /**
             * Param variants.
             * @member {string} variants
             * @memberof pb.Elastic.Param
             * @instance
             */
            Param.prototype.variants = "";

            /**
             * Creates a new Param instance using the specified properties.
             * @function create
             * @memberof pb.Elastic.Param
             * @static
             * @param {pb.Elastic.IParam=} [properties] Properties to set
             * @returns {pb.Elastic.Param} Param instance
             */
            Param.create = function create(properties) {
                return new Param(properties);
            };

            /**
             * Encodes the specified Param message. Does not implicitly {@link pb.Elastic.Param.verify|verify} messages.
             * @function encode
             * @memberof pb.Elastic.Param
             * @static
             * @param {pb.Elastic.IParam} message Param message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Param.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && message.hasOwnProperty("name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.size != null && message.hasOwnProperty("size"))
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.size);
                if (message.flags != null && message.hasOwnProperty("flags"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.flags);
                if (message.description != null && message.hasOwnProperty("description"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.description);
                if (message.variants != null && message.hasOwnProperty("variants"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.variants);
                return writer;
            };

            /**
             * Encodes the specified Param message, length delimited. Does not implicitly {@link pb.Elastic.Param.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Elastic.Param
             * @static
             * @param {pb.Elastic.IParam} message Param message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Param.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Param message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Elastic.Param
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Elastic.Param} Param
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Param.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Elastic.Param();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.name = reader.string();
                        break;
                    case 2:
                        message.size = reader.double();
                        break;
                    case 3:
                        message.flags = reader.uint32();
                        break;
                    case 4:
                        message.description = reader.string();
                        break;
                    case 5:
                        message.variants = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Param message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Elastic.Param
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Elastic.Param} Param
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Param.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Param message.
             * @function verify
             * @memberof pb.Elastic.Param
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Param.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.size != null && message.hasOwnProperty("size"))
                    if (typeof message.size !== "number")
                        return "size: number expected";
                if (message.flags != null && message.hasOwnProperty("flags"))
                    if (!$util.isInteger(message.flags))
                        return "flags: integer expected";
                if (message.description != null && message.hasOwnProperty("description"))
                    if (!$util.isString(message.description))
                        return "description: string expected";
                if (message.variants != null && message.hasOwnProperty("variants"))
                    if (!$util.isString(message.variants))
                        return "variants: string expected";
                return null;
            };

            /**
             * Creates a Param message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Elastic.Param
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Elastic.Param} Param
             */
            Param.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Elastic.Param)
                    return object;
                var message = new $root.pb.Elastic.Param();
                if (object.name != null)
                    message.name = String(object.name);
                if (object.size != null)
                    message.size = Number(object.size);
                if (object.flags != null)
                    message.flags = object.flags >>> 0;
                if (object.description != null)
                    message.description = String(object.description);
                if (object.variants != null)
                    message.variants = String(object.variants);
                return message;
            };

            /**
             * Creates a plain object from a Param message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Elastic.Param
             * @static
             * @param {pb.Elastic.Param} message Param
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Param.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.name = "";
                    object.size = 0;
                    object.flags = 0;
                    object.description = "";
                    object.variants = "";
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.size != null && message.hasOwnProperty("size"))
                    object.size = options.json && !isFinite(message.size) ? String(message.size) : message.size;
                if (message.flags != null && message.hasOwnProperty("flags"))
                    object.flags = message.flags;
                if (message.description != null && message.hasOwnProperty("description"))
                    object.description = message.description;
                if (message.variants != null && message.hasOwnProperty("variants"))
                    object.variants = message.variants;
                return object;
            };

            /**
             * Converts this Param to JSON.
             * @function toJSON
             * @memberof pb.Elastic.Param
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Param.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Param;
        })();

        return Elastic;
    })();

    pb.Content = (function() {

        /**
         * Properties of a Content.
         * @memberof pb
         * @interface IContent
         * @property {boolean|null} [hasCommon] Content hasCommon
         * @property {pb.ICommon|null} [common] Content common
         * @property {boolean|null} [hasTransform] Content hasTransform
         * @property {pb.ITransform|null} [transform] Content transform
         * @property {boolean|null} [hasGeometry] Content hasGeometry
         * @property {pb.IGeometry|null} [geometry] Content geometry
         * @property {boolean|null} [hasEdges] Content hasEdges
         * @property {pb.IEdges|null} [edges] Content edges
         * @property {boolean|null} [hasData] Content hasData
         * @property {string|null} [data] Content data
         * @property {number|Long|null} [dataUidMask] Content dataUidMask
         * @property {boolean|null} [hasAnim] Content hasAnim
         * @property {pb.ICompoundAnimation|null} [anim] Content anim
         * @property {boolean|null} [hasElastic] Content hasElastic
         * @property {pb.IElastic|null} [elastic] Content elastic
         */

        /**
         * Constructs a new Content.
         * @memberof pb
         * @classdesc Represents a Content.
         * @implements IContent
         * @constructor
         * @param {pb.IContent=} [properties] Properties to set
         */
        function Content(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Content hasCommon.
         * @member {boolean} hasCommon
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.hasCommon = false;

        /**
         * Content common.
         * @member {pb.ICommon|null|undefined} common
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.common = null;

        /**
         * Content hasTransform.
         * @member {boolean} hasTransform
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.hasTransform = false;

        /**
         * Content transform.
         * @member {pb.ITransform|null|undefined} transform
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.transform = null;

        /**
         * Content hasGeometry.
         * @member {boolean} hasGeometry
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.hasGeometry = false;

        /**
         * Content geometry.
         * @member {pb.IGeometry|null|undefined} geometry
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.geometry = null;

        /**
         * Content hasEdges.
         * @member {boolean} hasEdges
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.hasEdges = false;

        /**
         * Content edges.
         * @member {pb.IEdges|null|undefined} edges
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.edges = null;

        /**
         * Content hasData.
         * @member {boolean} hasData
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.hasData = false;

        /**
         * Content data.
         * @member {string} data
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.data = "";

        /**
         * Content dataUidMask.
         * @member {number|Long} dataUidMask
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.dataUidMask = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Content hasAnim.
         * @member {boolean} hasAnim
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.hasAnim = false;

        /**
         * Content anim.
         * @member {pb.ICompoundAnimation|null|undefined} anim
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.anim = null;

        /**
         * Content hasElastic.
         * @member {boolean} hasElastic
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.hasElastic = false;

        /**
         * Content elastic.
         * @member {pb.IElastic|null|undefined} elastic
         * @memberof pb.Content
         * @instance
         */
        Content.prototype.elastic = null;

        /**
         * Creates a new Content instance using the specified properties.
         * @function create
         * @memberof pb.Content
         * @static
         * @param {pb.IContent=} [properties] Properties to set
         * @returns {pb.Content} Content instance
         */
        Content.create = function create(properties) {
            return new Content(properties);
        };

        /**
         * Encodes the specified Content message. Does not implicitly {@link pb.Content.verify|verify} messages.
         * @function encode
         * @memberof pb.Content
         * @static
         * @param {pb.IContent} message Content message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Content.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.hasCommon != null && message.hasOwnProperty("hasCommon"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.hasCommon);
            if (message.common != null && message.hasOwnProperty("common"))
                $root.pb.Common.encode(message.common, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.hasTransform != null && message.hasOwnProperty("hasTransform"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.hasTransform);
            if (message.transform != null && message.hasOwnProperty("transform"))
                $root.pb.Transform.encode(message.transform, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.hasGeometry != null && message.hasOwnProperty("hasGeometry"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.hasGeometry);
            if (message.geometry != null && message.hasOwnProperty("geometry"))
                $root.pb.Geometry.encode(message.geometry, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.hasEdges != null && message.hasOwnProperty("hasEdges"))
                writer.uint32(/* id 7, wireType 0 =*/56).bool(message.hasEdges);
            if (message.edges != null && message.hasOwnProperty("edges"))
                $root.pb.Edges.encode(message.edges, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.hasData != null && message.hasOwnProperty("hasData"))
                writer.uint32(/* id 9, wireType 0 =*/72).bool(message.hasData);
            if (message.data != null && message.hasOwnProperty("data"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.data);
            if (message.dataUidMask != null && message.hasOwnProperty("dataUidMask"))
                writer.uint32(/* id 11, wireType 1 =*/89).fixed64(message.dataUidMask);
            if (message.hasAnim != null && message.hasOwnProperty("hasAnim"))
                writer.uint32(/* id 12, wireType 0 =*/96).bool(message.hasAnim);
            if (message.anim != null && message.hasOwnProperty("anim"))
                $root.pb.CompoundAnimation.encode(message.anim, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
            if (message.hasElastic != null && message.hasOwnProperty("hasElastic"))
                writer.uint32(/* id 14, wireType 0 =*/112).bool(message.hasElastic);
            if (message.elastic != null && message.hasOwnProperty("elastic"))
                $root.pb.Elastic.encode(message.elastic, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Content message, length delimited. Does not implicitly {@link pb.Content.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Content
         * @static
         * @param {pb.IContent} message Content message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Content.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Content message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Content
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Content} Content
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Content.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Content();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.hasCommon = reader.bool();
                    break;
                case 2:
                    message.common = $root.pb.Common.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.hasTransform = reader.bool();
                    break;
                case 4:
                    message.transform = $root.pb.Transform.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.hasGeometry = reader.bool();
                    break;
                case 6:
                    message.geometry = $root.pb.Geometry.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.hasEdges = reader.bool();
                    break;
                case 8:
                    message.edges = $root.pb.Edges.decode(reader, reader.uint32());
                    break;
                case 9:
                    message.hasData = reader.bool();
                    break;
                case 10:
                    message.data = reader.string();
                    break;
                case 11:
                    message.dataUidMask = reader.fixed64();
                    break;
                case 12:
                    message.hasAnim = reader.bool();
                    break;
                case 13:
                    message.anim = $root.pb.CompoundAnimation.decode(reader, reader.uint32());
                    break;
                case 14:
                    message.hasElastic = reader.bool();
                    break;
                case 15:
                    message.elastic = $root.pb.Elastic.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Content message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Content
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Content} Content
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Content.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Content message.
         * @function verify
         * @memberof pb.Content
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Content.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.hasCommon != null && message.hasOwnProperty("hasCommon"))
                if (typeof message.hasCommon !== "boolean")
                    return "hasCommon: boolean expected";
            if (message.common != null && message.hasOwnProperty("common")) {
                var error = $root.pb.Common.verify(message.common);
                if (error)
                    return "common." + error;
            }
            if (message.hasTransform != null && message.hasOwnProperty("hasTransform"))
                if (typeof message.hasTransform !== "boolean")
                    return "hasTransform: boolean expected";
            if (message.transform != null && message.hasOwnProperty("transform")) {
                var error = $root.pb.Transform.verify(message.transform);
                if (error)
                    return "transform." + error;
            }
            if (message.hasGeometry != null && message.hasOwnProperty("hasGeometry"))
                if (typeof message.hasGeometry !== "boolean")
                    return "hasGeometry: boolean expected";
            if (message.geometry != null && message.hasOwnProperty("geometry")) {
                var error = $root.pb.Geometry.verify(message.geometry);
                if (error)
                    return "geometry." + error;
            }
            if (message.hasEdges != null && message.hasOwnProperty("hasEdges"))
                if (typeof message.hasEdges !== "boolean")
                    return "hasEdges: boolean expected";
            if (message.edges != null && message.hasOwnProperty("edges")) {
                var error = $root.pb.Edges.verify(message.edges);
                if (error)
                    return "edges." + error;
            }
            if (message.hasData != null && message.hasOwnProperty("hasData"))
                if (typeof message.hasData !== "boolean")
                    return "hasData: boolean expected";
            if (message.data != null && message.hasOwnProperty("data"))
                if (!$util.isString(message.data))
                    return "data: string expected";
            if (message.dataUidMask != null && message.hasOwnProperty("dataUidMask"))
                if (!$util.isInteger(message.dataUidMask) && !(message.dataUidMask && $util.isInteger(message.dataUidMask.low) && $util.isInteger(message.dataUidMask.high)))
                    return "dataUidMask: integer|Long expected";
            if (message.hasAnim != null && message.hasOwnProperty("hasAnim"))
                if (typeof message.hasAnim !== "boolean")
                    return "hasAnim: boolean expected";
            if (message.anim != null && message.hasOwnProperty("anim")) {
                var error = $root.pb.CompoundAnimation.verify(message.anim);
                if (error)
                    return "anim." + error;
            }
            if (message.hasElastic != null && message.hasOwnProperty("hasElastic"))
                if (typeof message.hasElastic !== "boolean")
                    return "hasElastic: boolean expected";
            if (message.elastic != null && message.hasOwnProperty("elastic")) {
                var error = $root.pb.Elastic.verify(message.elastic);
                if (error)
                    return "elastic." + error;
            }
            return null;
        };

        /**
         * Creates a Content message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Content
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Content} Content
         */
        Content.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Content)
                return object;
            var message = new $root.pb.Content();
            if (object.hasCommon != null)
                message.hasCommon = Boolean(object.hasCommon);
            if (object.common != null) {
                if (typeof object.common !== "object")
                    throw TypeError(".pb.Content.common: object expected");
                message.common = $root.pb.Common.fromObject(object.common);
            }
            if (object.hasTransform != null)
                message.hasTransform = Boolean(object.hasTransform);
            if (object.transform != null) {
                if (typeof object.transform !== "object")
                    throw TypeError(".pb.Content.transform: object expected");
                message.transform = $root.pb.Transform.fromObject(object.transform);
            }
            if (object.hasGeometry != null)
                message.hasGeometry = Boolean(object.hasGeometry);
            if (object.geometry != null) {
                if (typeof object.geometry !== "object")
                    throw TypeError(".pb.Content.geometry: object expected");
                message.geometry = $root.pb.Geometry.fromObject(object.geometry);
            }
            if (object.hasEdges != null)
                message.hasEdges = Boolean(object.hasEdges);
            if (object.edges != null) {
                if (typeof object.edges !== "object")
                    throw TypeError(".pb.Content.edges: object expected");
                message.edges = $root.pb.Edges.fromObject(object.edges);
            }
            if (object.hasData != null)
                message.hasData = Boolean(object.hasData);
            if (object.data != null)
                message.data = String(object.data);
            if (object.dataUidMask != null)
                if ($util.Long)
                    (message.dataUidMask = $util.Long.fromValue(object.dataUidMask)).unsigned = false;
                else if (typeof object.dataUidMask === "string")
                    message.dataUidMask = parseInt(object.dataUidMask, 10);
                else if (typeof object.dataUidMask === "number")
                    message.dataUidMask = object.dataUidMask;
                else if (typeof object.dataUidMask === "object")
                    message.dataUidMask = new $util.LongBits(object.dataUidMask.low >>> 0, object.dataUidMask.high >>> 0).toNumber();
            if (object.hasAnim != null)
                message.hasAnim = Boolean(object.hasAnim);
            if (object.anim != null) {
                if (typeof object.anim !== "object")
                    throw TypeError(".pb.Content.anim: object expected");
                message.anim = $root.pb.CompoundAnimation.fromObject(object.anim);
            }
            if (object.hasElastic != null)
                message.hasElastic = Boolean(object.hasElastic);
            if (object.elastic != null) {
                if (typeof object.elastic !== "object")
                    throw TypeError(".pb.Content.elastic: object expected");
                message.elastic = $root.pb.Elastic.fromObject(object.elastic);
            }
            return message;
        };

        /**
         * Creates a plain object from a Content message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Content
         * @static
         * @param {pb.Content} message Content
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Content.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.hasCommon = false;
                object.common = null;
                object.hasTransform = false;
                object.transform = null;
                object.hasGeometry = false;
                object.geometry = null;
                object.hasEdges = false;
                object.edges = null;
                object.hasData = false;
                object.data = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.dataUidMask = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.dataUidMask = options.longs === String ? "0" : 0;
                object.hasAnim = false;
                object.anim = null;
                object.hasElastic = false;
                object.elastic = null;
            }
            if (message.hasCommon != null && message.hasOwnProperty("hasCommon"))
                object.hasCommon = message.hasCommon;
            if (message.common != null && message.hasOwnProperty("common"))
                object.common = $root.pb.Common.toObject(message.common, options);
            if (message.hasTransform != null && message.hasOwnProperty("hasTransform"))
                object.hasTransform = message.hasTransform;
            if (message.transform != null && message.hasOwnProperty("transform"))
                object.transform = $root.pb.Transform.toObject(message.transform, options);
            if (message.hasGeometry != null && message.hasOwnProperty("hasGeometry"))
                object.hasGeometry = message.hasGeometry;
            if (message.geometry != null && message.hasOwnProperty("geometry"))
                object.geometry = $root.pb.Geometry.toObject(message.geometry, options);
            if (message.hasEdges != null && message.hasOwnProperty("hasEdges"))
                object.hasEdges = message.hasEdges;
            if (message.edges != null && message.hasOwnProperty("edges"))
                object.edges = $root.pb.Edges.toObject(message.edges, options);
            if (message.hasData != null && message.hasOwnProperty("hasData"))
                object.hasData = message.hasData;
            if (message.data != null && message.hasOwnProperty("data"))
                object.data = message.data;
            if (message.dataUidMask != null && message.hasOwnProperty("dataUidMask"))
                if (typeof message.dataUidMask === "number")
                    object.dataUidMask = options.longs === String ? String(message.dataUidMask) : message.dataUidMask;
                else
                    object.dataUidMask = options.longs === String ? $util.Long.prototype.toString.call(message.dataUidMask) : options.longs === Number ? new $util.LongBits(message.dataUidMask.low >>> 0, message.dataUidMask.high >>> 0).toNumber() : message.dataUidMask;
            if (message.hasAnim != null && message.hasOwnProperty("hasAnim"))
                object.hasAnim = message.hasAnim;
            if (message.anim != null && message.hasOwnProperty("anim"))
                object.anim = $root.pb.CompoundAnimation.toObject(message.anim, options);
            if (message.hasElastic != null && message.hasOwnProperty("hasElastic"))
                object.hasElastic = message.hasElastic;
            if (message.elastic != null && message.hasOwnProperty("elastic"))
                object.elastic = $root.pb.Elastic.toObject(message.elastic, options);
            return object;
        };

        /**
         * Converts this Content to JSON.
         * @function toJSON
         * @memberof pb.Content
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Content.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Content;
    })();

    pb.Entity = (function() {

        /**
         * Properties of an Entity.
         * @memberof pb
         * @interface IEntity
         * @property {number|Long|null} [uid] Entity uid
         * @property {pb.IContent|null} [content] Entity content
         * @property {boolean|null} [syncChildren] Entity syncChildren
         * @property {Array.<number|Long>|null} [child] Entity child
         */

        /**
         * Constructs a new Entity.
         * @memberof pb
         * @classdesc Represents an Entity.
         * @implements IEntity
         * @constructor
         * @param {pb.IEntity=} [properties] Properties to set
         */
        function Entity(properties) {
            this.child = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Entity uid.
         * @member {number|Long} uid
         * @memberof pb.Entity
         * @instance
         */
        Entity.prototype.uid = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Entity content.
         * @member {pb.IContent|null|undefined} content
         * @memberof pb.Entity
         * @instance
         */
        Entity.prototype.content = null;

        /**
         * Entity syncChildren.
         * @member {boolean} syncChildren
         * @memberof pb.Entity
         * @instance
         */
        Entity.prototype.syncChildren = false;

        /**
         * Entity child.
         * @member {Array.<number|Long>} child
         * @memberof pb.Entity
         * @instance
         */
        Entity.prototype.child = $util.emptyArray;

        /**
         * Creates a new Entity instance using the specified properties.
         * @function create
         * @memberof pb.Entity
         * @static
         * @param {pb.IEntity=} [properties] Properties to set
         * @returns {pb.Entity} Entity instance
         */
        Entity.create = function create(properties) {
            return new Entity(properties);
        };

        /**
         * Encodes the specified Entity message. Does not implicitly {@link pb.Entity.verify|verify} messages.
         * @function encode
         * @memberof pb.Entity
         * @static
         * @param {pb.IEntity} message Entity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Entity.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.uid != null && message.hasOwnProperty("uid"))
                writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.uid);
            if (message.content != null && message.hasOwnProperty("content"))
                $root.pb.Content.encode(message.content, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.syncChildren != null && message.hasOwnProperty("syncChildren"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.syncChildren);
            if (message.child != null && message.child.length) {
                writer.uint32(/* id 4, wireType 2 =*/34).fork();
                for (var i = 0; i < message.child.length; ++i)
                    writer.fixed64(message.child[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified Entity message, length delimited. Does not implicitly {@link pb.Entity.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Entity
         * @static
         * @param {pb.IEntity} message Entity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Entity.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Entity message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Entity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Entity} Entity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Entity.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Entity();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.uid = reader.fixed64();
                    break;
                case 2:
                    message.content = $root.pb.Content.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.syncChildren = reader.bool();
                    break;
                case 4:
                    if (!(message.child && message.child.length))
                        message.child = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.child.push(reader.fixed64());
                    } else
                        message.child.push(reader.fixed64());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Entity message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Entity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Entity} Entity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Entity.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Entity message.
         * @function verify
         * @memberof pb.Entity
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Entity.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.uid != null && message.hasOwnProperty("uid"))
                if (!$util.isInteger(message.uid) && !(message.uid && $util.isInteger(message.uid.low) && $util.isInteger(message.uid.high)))
                    return "uid: integer|Long expected";
            if (message.content != null && message.hasOwnProperty("content")) {
                var error = $root.pb.Content.verify(message.content);
                if (error)
                    return "content." + error;
            }
            if (message.syncChildren != null && message.hasOwnProperty("syncChildren"))
                if (typeof message.syncChildren !== "boolean")
                    return "syncChildren: boolean expected";
            if (message.child != null && message.hasOwnProperty("child")) {
                if (!Array.isArray(message.child))
                    return "child: array expected";
                for (var i = 0; i < message.child.length; ++i)
                    if (!$util.isInteger(message.child[i]) && !(message.child[i] && $util.isInteger(message.child[i].low) && $util.isInteger(message.child[i].high)))
                        return "child: integer|Long[] expected";
            }
            return null;
        };

        /**
         * Creates an Entity message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Entity
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Entity} Entity
         */
        Entity.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Entity)
                return object;
            var message = new $root.pb.Entity();
            if (object.uid != null)
                if ($util.Long)
                    (message.uid = $util.Long.fromValue(object.uid)).unsigned = false;
                else if (typeof object.uid === "string")
                    message.uid = parseInt(object.uid, 10);
                else if (typeof object.uid === "number")
                    message.uid = object.uid;
                else if (typeof object.uid === "object")
                    message.uid = new $util.LongBits(object.uid.low >>> 0, object.uid.high >>> 0).toNumber();
            if (object.content != null) {
                if (typeof object.content !== "object")
                    throw TypeError(".pb.Entity.content: object expected");
                message.content = $root.pb.Content.fromObject(object.content);
            }
            if (object.syncChildren != null)
                message.syncChildren = Boolean(object.syncChildren);
            if (object.child) {
                if (!Array.isArray(object.child))
                    throw TypeError(".pb.Entity.child: array expected");
                message.child = [];
                for (var i = 0; i < object.child.length; ++i)
                    if ($util.Long)
                        (message.child[i] = $util.Long.fromValue(object.child[i])).unsigned = false;
                    else if (typeof object.child[i] === "string")
                        message.child[i] = parseInt(object.child[i], 10);
                    else if (typeof object.child[i] === "number")
                        message.child[i] = object.child[i];
                    else if (typeof object.child[i] === "object")
                        message.child[i] = new $util.LongBits(object.child[i].low >>> 0, object.child[i].high >>> 0).toNumber();
            }
            return message;
        };

        /**
         * Creates a plain object from an Entity message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Entity
         * @static
         * @param {pb.Entity} message Entity
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Entity.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.child = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.uid = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.uid = options.longs === String ? "0" : 0;
                object.content = null;
                object.syncChildren = false;
            }
            if (message.uid != null && message.hasOwnProperty("uid"))
                if (typeof message.uid === "number")
                    object.uid = options.longs === String ? String(message.uid) : message.uid;
                else
                    object.uid = options.longs === String ? $util.Long.prototype.toString.call(message.uid) : options.longs === Number ? new $util.LongBits(message.uid.low >>> 0, message.uid.high >>> 0).toNumber() : message.uid;
            if (message.content != null && message.hasOwnProperty("content"))
                object.content = $root.pb.Content.toObject(message.content, options);
            if (message.syncChildren != null && message.hasOwnProperty("syncChildren"))
                object.syncChildren = message.syncChildren;
            if (message.child && message.child.length) {
                object.child = [];
                for (var j = 0; j < message.child.length; ++j)
                    if (typeof message.child[j] === "number")
                        object.child[j] = options.longs === String ? String(message.child[j]) : message.child[j];
                    else
                        object.child[j] = options.longs === String ? $util.Long.prototype.toString.call(message.child[j]) : options.longs === Number ? new $util.LongBits(message.child[j].low >>> 0, message.child[j].high >>> 0).toNumber() : message.child[j];
            }
            return object;
        };

        /**
         * Converts this Entity to JSON.
         * @function toJSON
         * @memberof pb.Entity
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Entity.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Entity;
    })();

    pb.Scene = (function() {

        /**
         * Properties of a Scene.
         * @memberof pb
         * @interface IScene
         * @property {number|Long|null} [rootUid] Scene rootUid
         * @property {Array.<pb.IEntity>|null} [entity] Scene entity
         * @property {number|Long|null} [revision] Scene revision
         * @property {string|null} [undo] Scene undo
         * @property {string|null} [redo] Scene redo
         * @property {number|Long|null} [operation] Scene operation
         * @property {string|null} [camera] Scene camera
         */

        /**
         * Constructs a new Scene.
         * @memberof pb
         * @classdesc Represents a Scene.
         * @implements IScene
         * @constructor
         * @param {pb.IScene=} [properties] Properties to set
         */
        function Scene(properties) {
            this.entity = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Scene rootUid.
         * @member {number|Long} rootUid
         * @memberof pb.Scene
         * @instance
         */
        Scene.prototype.rootUid = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Scene entity.
         * @member {Array.<pb.IEntity>} entity
         * @memberof pb.Scene
         * @instance
         */
        Scene.prototype.entity = $util.emptyArray;

        /**
         * Scene revision.
         * @member {number|Long} revision
         * @memberof pb.Scene
         * @instance
         */
        Scene.prototype.revision = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Scene undo.
         * @member {string} undo
         * @memberof pb.Scene
         * @instance
         */
        Scene.prototype.undo = "";

        /**
         * Scene redo.
         * @member {string} redo
         * @memberof pb.Scene
         * @instance
         */
        Scene.prototype.redo = "";

        /**
         * Scene operation.
         * @member {number|Long} operation
         * @memberof pb.Scene
         * @instance
         */
        Scene.prototype.operation = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Scene camera.
         * @member {string} camera
         * @memberof pb.Scene
         * @instance
         */
        Scene.prototype.camera = "";

        /**
         * Creates a new Scene instance using the specified properties.
         * @function create
         * @memberof pb.Scene
         * @static
         * @param {pb.IScene=} [properties] Properties to set
         * @returns {pb.Scene} Scene instance
         */
        Scene.create = function create(properties) {
            return new Scene(properties);
        };

        /**
         * Encodes the specified Scene message. Does not implicitly {@link pb.Scene.verify|verify} messages.
         * @function encode
         * @memberof pb.Scene
         * @static
         * @param {pb.IScene} message Scene message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Scene.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.rootUid != null && message.hasOwnProperty("rootUid"))
                writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.rootUid);
            if (message.entity != null && message.entity.length)
                for (var i = 0; i < message.entity.length; ++i)
                    $root.pb.Entity.encode(message.entity[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.revision != null && message.hasOwnProperty("revision"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.revision);
            if (message.undo != null && message.hasOwnProperty("undo"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.undo);
            if (message.redo != null && message.hasOwnProperty("redo"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.redo);
            if (message.operation != null && message.hasOwnProperty("operation"))
                writer.uint32(/* id 6, wireType 1 =*/49).fixed64(message.operation);
            if (message.camera != null && message.hasOwnProperty("camera"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.camera);
            return writer;
        };

        /**
         * Encodes the specified Scene message, length delimited. Does not implicitly {@link pb.Scene.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Scene
         * @static
         * @param {pb.IScene} message Scene message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Scene.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Scene message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Scene
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Scene} Scene
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Scene.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Scene();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.rootUid = reader.fixed64();
                    break;
                case 2:
                    if (!(message.entity && message.entity.length))
                        message.entity = [];
                    message.entity.push($root.pb.Entity.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.revision = reader.uint64();
                    break;
                case 4:
                    message.undo = reader.string();
                    break;
                case 5:
                    message.redo = reader.string();
                    break;
                case 6:
                    message.operation = reader.fixed64();
                    break;
                case 7:
                    message.camera = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Scene message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Scene
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Scene} Scene
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Scene.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Scene message.
         * @function verify
         * @memberof pb.Scene
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Scene.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.rootUid != null && message.hasOwnProperty("rootUid"))
                if (!$util.isInteger(message.rootUid) && !(message.rootUid && $util.isInteger(message.rootUid.low) && $util.isInteger(message.rootUid.high)))
                    return "rootUid: integer|Long expected";
            if (message.entity != null && message.hasOwnProperty("entity")) {
                if (!Array.isArray(message.entity))
                    return "entity: array expected";
                for (var i = 0; i < message.entity.length; ++i) {
                    var error = $root.pb.Entity.verify(message.entity[i]);
                    if (error)
                        return "entity." + error;
                }
            }
            if (message.revision != null && message.hasOwnProperty("revision"))
                if (!$util.isInteger(message.revision) && !(message.revision && $util.isInteger(message.revision.low) && $util.isInteger(message.revision.high)))
                    return "revision: integer|Long expected";
            if (message.undo != null && message.hasOwnProperty("undo"))
                if (!$util.isString(message.undo))
                    return "undo: string expected";
            if (message.redo != null && message.hasOwnProperty("redo"))
                if (!$util.isString(message.redo))
                    return "redo: string expected";
            if (message.operation != null && message.hasOwnProperty("operation"))
                if (!$util.isInteger(message.operation) && !(message.operation && $util.isInteger(message.operation.low) && $util.isInteger(message.operation.high)))
                    return "operation: integer|Long expected";
            if (message.camera != null && message.hasOwnProperty("camera"))
                if (!$util.isString(message.camera))
                    return "camera: string expected";
            return null;
        };

        /**
         * Creates a Scene message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Scene
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Scene} Scene
         */
        Scene.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Scene)
                return object;
            var message = new $root.pb.Scene();
            if (object.rootUid != null)
                if ($util.Long)
                    (message.rootUid = $util.Long.fromValue(object.rootUid)).unsigned = false;
                else if (typeof object.rootUid === "string")
                    message.rootUid = parseInt(object.rootUid, 10);
                else if (typeof object.rootUid === "number")
                    message.rootUid = object.rootUid;
                else if (typeof object.rootUid === "object")
                    message.rootUid = new $util.LongBits(object.rootUid.low >>> 0, object.rootUid.high >>> 0).toNumber();
            if (object.entity) {
                if (!Array.isArray(object.entity))
                    throw TypeError(".pb.Scene.entity: array expected");
                message.entity = [];
                for (var i = 0; i < object.entity.length; ++i) {
                    if (typeof object.entity[i] !== "object")
                        throw TypeError(".pb.Scene.entity: object expected");
                    message.entity[i] = $root.pb.Entity.fromObject(object.entity[i]);
                }
            }
            if (object.revision != null)
                if ($util.Long)
                    (message.revision = $util.Long.fromValue(object.revision)).unsigned = true;
                else if (typeof object.revision === "string")
                    message.revision = parseInt(object.revision, 10);
                else if (typeof object.revision === "number")
                    message.revision = object.revision;
                else if (typeof object.revision === "object")
                    message.revision = new $util.LongBits(object.revision.low >>> 0, object.revision.high >>> 0).toNumber(true);
            if (object.undo != null)
                message.undo = String(object.undo);
            if (object.redo != null)
                message.redo = String(object.redo);
            if (object.operation != null)
                if ($util.Long)
                    (message.operation = $util.Long.fromValue(object.operation)).unsigned = false;
                else if (typeof object.operation === "string")
                    message.operation = parseInt(object.operation, 10);
                else if (typeof object.operation === "number")
                    message.operation = object.operation;
                else if (typeof object.operation === "object")
                    message.operation = new $util.LongBits(object.operation.low >>> 0, object.operation.high >>> 0).toNumber();
            if (object.camera != null)
                message.camera = String(object.camera);
            return message;
        };

        /**
         * Creates a plain object from a Scene message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Scene
         * @static
         * @param {pb.Scene} message Scene
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Scene.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.entity = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.rootUid = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.rootUid = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.revision = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.revision = options.longs === String ? "0" : 0;
                object.undo = "";
                object.redo = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.operation = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.operation = options.longs === String ? "0" : 0;
                object.camera = "";
            }
            if (message.rootUid != null && message.hasOwnProperty("rootUid"))
                if (typeof message.rootUid === "number")
                    object.rootUid = options.longs === String ? String(message.rootUid) : message.rootUid;
                else
                    object.rootUid = options.longs === String ? $util.Long.prototype.toString.call(message.rootUid) : options.longs === Number ? new $util.LongBits(message.rootUid.low >>> 0, message.rootUid.high >>> 0).toNumber() : message.rootUid;
            if (message.entity && message.entity.length) {
                object.entity = [];
                for (var j = 0; j < message.entity.length; ++j)
                    object.entity[j] = $root.pb.Entity.toObject(message.entity[j], options);
            }
            if (message.revision != null && message.hasOwnProperty("revision"))
                if (typeof message.revision === "number")
                    object.revision = options.longs === String ? String(message.revision) : message.revision;
                else
                    object.revision = options.longs === String ? $util.Long.prototype.toString.call(message.revision) : options.longs === Number ? new $util.LongBits(message.revision.low >>> 0, message.revision.high >>> 0).toNumber(true) : message.revision;
            if (message.undo != null && message.hasOwnProperty("undo"))
                object.undo = message.undo;
            if (message.redo != null && message.hasOwnProperty("redo"))
                object.redo = message.redo;
            if (message.operation != null && message.hasOwnProperty("operation"))
                if (typeof message.operation === "number")
                    object.operation = options.longs === String ? String(message.operation) : message.operation;
                else
                    object.operation = options.longs === String ? $util.Long.prototype.toString.call(message.operation) : options.longs === Number ? new $util.LongBits(message.operation.low >>> 0, message.operation.high >>> 0).toNumber() : message.operation;
            if (message.camera != null && message.hasOwnProperty("camera"))
                object.camera = message.camera;
            return object;
        };

        /**
         * Converts this Scene to JSON.
         * @function toJSON
         * @memberof pb.Scene
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Scene.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Scene;
    })();

    pb.PBTest = (function() {

        /**
         * Properties of a PBTest.
         * @memberof pb
         * @interface IPBTest
         * @property {number|null} [count] PBTest count
         * @property {string|null} [text] PBTest text
         */

        /**
         * Constructs a new PBTest.
         * @memberof pb
         * @classdesc Represents a PBTest.
         * @implements IPBTest
         * @constructor
         * @param {pb.IPBTest=} [properties] Properties to set
         */
        function PBTest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PBTest count.
         * @member {number} count
         * @memberof pb.PBTest
         * @instance
         */
        PBTest.prototype.count = 0;

        /**
         * PBTest text.
         * @member {string} text
         * @memberof pb.PBTest
         * @instance
         */
        PBTest.prototype.text = "";

        /**
         * Creates a new PBTest instance using the specified properties.
         * @function create
         * @memberof pb.PBTest
         * @static
         * @param {pb.IPBTest=} [properties] Properties to set
         * @returns {pb.PBTest} PBTest instance
         */
        PBTest.create = function create(properties) {
            return new PBTest(properties);
        };

        /**
         * Encodes the specified PBTest message. Does not implicitly {@link pb.PBTest.verify|verify} messages.
         * @function encode
         * @memberof pb.PBTest
         * @static
         * @param {pb.IPBTest} message PBTest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PBTest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.count != null && message.hasOwnProperty("count"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.count);
            if (message.text != null && message.hasOwnProperty("text"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.text);
            return writer;
        };

        /**
         * Encodes the specified PBTest message, length delimited. Does not implicitly {@link pb.PBTest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.PBTest
         * @static
         * @param {pb.IPBTest} message PBTest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PBTest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PBTest message from the specified reader or buffer.
         * @function decode
         * @memberof pb.PBTest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.PBTest} PBTest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PBTest.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.PBTest();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.count = reader.int32();
                    break;
                case 2:
                    message.text = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PBTest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.PBTest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.PBTest} PBTest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PBTest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PBTest message.
         * @function verify
         * @memberof pb.PBTest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PBTest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.count != null && message.hasOwnProperty("count"))
                if (!$util.isInteger(message.count))
                    return "count: integer expected";
            if (message.text != null && message.hasOwnProperty("text"))
                if (!$util.isString(message.text))
                    return "text: string expected";
            return null;
        };

        /**
         * Creates a PBTest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.PBTest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.PBTest} PBTest
         */
        PBTest.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.PBTest)
                return object;
            var message = new $root.pb.PBTest();
            if (object.count != null)
                message.count = object.count | 0;
            if (object.text != null)
                message.text = String(object.text);
            return message;
        };

        /**
         * Creates a plain object from a PBTest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.PBTest
         * @static
         * @param {pb.PBTest} message PBTest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PBTest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.count = 0;
                object.text = "";
            }
            if (message.count != null && message.hasOwnProperty("count"))
                object.count = message.count;
            if (message.text != null && message.hasOwnProperty("text"))
                object.text = message.text;
            return object;
        };

        /**
         * Converts this PBTest to JSON.
         * @function toJSON
         * @memberof pb.PBTest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PBTest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return PBTest;
    })();

    pb.Material = (function() {

        /**
         * Properties of a Material.
         * @memberof pb
         * @interface IMaterial
         * @property {string|null} [name] Material name
         * @property {number|null} [catalog] Material catalog
         * @property {number|null} [thickness] Material thickness
         * @property {number|null} [width] Material width
         */

        /**
         * Constructs a new Material.
         * @memberof pb
         * @classdesc Represents a Material.
         * @implements IMaterial
         * @constructor
         * @param {pb.IMaterial=} [properties] Properties to set
         */
        function Material(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Material name.
         * @member {string} name
         * @memberof pb.Material
         * @instance
         */
        Material.prototype.name = "";

        /**
         * Material catalog.
         * @member {number} catalog
         * @memberof pb.Material
         * @instance
         */
        Material.prototype.catalog = 0;

        /**
         * Material thickness.
         * @member {number} thickness
         * @memberof pb.Material
         * @instance
         */
        Material.prototype.thickness = 0;

        /**
         * Material width.
         * @member {number} width
         * @memberof pb.Material
         * @instance
         */
        Material.prototype.width = 0;

        /**
         * Creates a new Material instance using the specified properties.
         * @function create
         * @memberof pb.Material
         * @static
         * @param {pb.IMaterial=} [properties] Properties to set
         * @returns {pb.Material} Material instance
         */
        Material.create = function create(properties) {
            return new Material(properties);
        };

        /**
         * Encodes the specified Material message. Does not implicitly {@link pb.Material.verify|verify} messages.
         * @function encode
         * @memberof pb.Material
         * @static
         * @param {pb.IMaterial} message Material message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Material.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.thickness != null && message.hasOwnProperty("thickness"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.thickness);
            if (message.width != null && message.hasOwnProperty("width"))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.width);
            if (message.catalog != null && message.hasOwnProperty("catalog"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.catalog);
            return writer;
        };

        /**
         * Encodes the specified Material message, length delimited. Does not implicitly {@link pb.Material.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Material
         * @static
         * @param {pb.IMaterial} message Material message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Material.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Material message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Material
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Material} Material
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Material.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Material();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 4:
                    message.catalog = reader.int32();
                    break;
                case 2:
                    message.thickness = reader.double();
                    break;
                case 3:
                    message.width = reader.double();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Material message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Material
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Material} Material
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Material.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Material message.
         * @function verify
         * @memberof pb.Material
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Material.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.catalog != null && message.hasOwnProperty("catalog"))
                if (!$util.isInteger(message.catalog))
                    return "catalog: integer expected";
            if (message.thickness != null && message.hasOwnProperty("thickness"))
                if (typeof message.thickness !== "number")
                    return "thickness: number expected";
            if (message.width != null && message.hasOwnProperty("width"))
                if (typeof message.width !== "number")
                    return "width: number expected";
            return null;
        };

        /**
         * Creates a Material message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Material
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Material} Material
         */
        Material.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Material)
                return object;
            var message = new $root.pb.Material();
            if (object.name != null)
                message.name = String(object.name);
            if (object.catalog != null)
                message.catalog = object.catalog | 0;
            if (object.thickness != null)
                message.thickness = Number(object.thickness);
            if (object.width != null)
                message.width = Number(object.width);
            return message;
        };

        /**
         * Creates a plain object from a Material message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Material
         * @static
         * @param {pb.Material} message Material
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Material.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.thickness = 0;
                object.width = 0;
                object.catalog = 0;
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.thickness != null && message.hasOwnProperty("thickness"))
                object.thickness = options.json && !isFinite(message.thickness) ? String(message.thickness) : message.thickness;
            if (message.width != null && message.hasOwnProperty("width"))
                object.width = options.json && !isFinite(message.width) ? String(message.width) : message.width;
            if (message.catalog != null && message.hasOwnProperty("catalog"))
                object.catalog = message.catalog;
            return object;
        };

        /**
         * Converts this Material to JSON.
         * @function toJSON
         * @memberof pb.Material
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Material.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Material;
    })();

    pb.Vector3D = (function() {

        /**
         * Properties of a Vector3D.
         * @memberof pb
         * @interface IVector3D
         * @property {number|null} [x] Vector3D x
         * @property {number|null} [y] Vector3D y
         * @property {number|null} [z] Vector3D z
         */

        /**
         * Constructs a new Vector3D.
         * @memberof pb
         * @classdesc Represents a Vector3D.
         * @implements IVector3D
         * @constructor
         * @param {pb.IVector3D=} [properties] Properties to set
         */
        function Vector3D(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Vector3D x.
         * @member {number} x
         * @memberof pb.Vector3D
         * @instance
         */
        Vector3D.prototype.x = 0;

        /**
         * Vector3D y.
         * @member {number} y
         * @memberof pb.Vector3D
         * @instance
         */
        Vector3D.prototype.y = 0;

        /**
         * Vector3D z.
         * @member {number} z
         * @memberof pb.Vector3D
         * @instance
         */
        Vector3D.prototype.z = 0;

        /**
         * Creates a new Vector3D instance using the specified properties.
         * @function create
         * @memberof pb.Vector3D
         * @static
         * @param {pb.IVector3D=} [properties] Properties to set
         * @returns {pb.Vector3D} Vector3D instance
         */
        Vector3D.create = function create(properties) {
            return new Vector3D(properties);
        };

        /**
         * Encodes the specified Vector3D message. Does not implicitly {@link pb.Vector3D.verify|verify} messages.
         * @function encode
         * @memberof pb.Vector3D
         * @static
         * @param {pb.IVector3D} message Vector3D message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Vector3D.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.x != null && message.hasOwnProperty("x"))
                writer.uint32(/* id 1, wireType 1 =*/9).double(message.x);
            if (message.y != null && message.hasOwnProperty("y"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.y);
            if (message.z != null && message.hasOwnProperty("z"))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.z);
            return writer;
        };

        /**
         * Encodes the specified Vector3D message, length delimited. Does not implicitly {@link pb.Vector3D.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Vector3D
         * @static
         * @param {pb.IVector3D} message Vector3D message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Vector3D.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Vector3D message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Vector3D
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Vector3D} Vector3D
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Vector3D.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Vector3D();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.x = reader.double();
                    break;
                case 2:
                    message.y = reader.double();
                    break;
                case 3:
                    message.z = reader.double();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Vector3D message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Vector3D
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Vector3D} Vector3D
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Vector3D.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Vector3D message.
         * @function verify
         * @memberof pb.Vector3D
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Vector3D.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.x != null && message.hasOwnProperty("x"))
                if (typeof message.x !== "number")
                    return "x: number expected";
            if (message.y != null && message.hasOwnProperty("y"))
                if (typeof message.y !== "number")
                    return "y: number expected";
            if (message.z != null && message.hasOwnProperty("z"))
                if (typeof message.z !== "number")
                    return "z: number expected";
            return null;
        };

        /**
         * Creates a Vector3D message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Vector3D
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Vector3D} Vector3D
         */
        Vector3D.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Vector3D)
                return object;
            var message = new $root.pb.Vector3D();
            if (object.x != null)
                message.x = Number(object.x);
            if (object.y != null)
                message.y = Number(object.y);
            if (object.z != null)
                message.z = Number(object.z);
            return message;
        };

        /**
         * Creates a plain object from a Vector3D message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Vector3D
         * @static
         * @param {pb.Vector3D} message Vector3D
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Vector3D.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.x = 0;
                object.y = 0;
                object.z = 0;
            }
            if (message.x != null && message.hasOwnProperty("x"))
                object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
            if (message.y != null && message.hasOwnProperty("y"))
                object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
            if (message.z != null && message.hasOwnProperty("z"))
                object.z = options.json && !isFinite(message.z) ? String(message.z) : message.z;
            return object;
        };

        /**
         * Converts this Vector3D to JSON.
         * @function toJSON
         * @memberof pb.Vector3D
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Vector3D.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Vector3D;
    })();

    pb.Element2D = (function() {

        /**
         * Properties of an Element2D.
         * @memberof pb
         * @interface IElement2D
         * @property {number|null} [uid] Element2D uid
         * @property {pb.Element2D.IGroup|null} [group] Element2D group
         * @property {pb.Element2D.IVector|null} [point] Element2D point
         * @property {pb.Element2D.ISegment|null} [segment] Element2D segment
         * @property {pb.Element2D.IArc|null} [arc] Element2D arc
         */

        /**
         * Constructs a new Element2D.
         * @memberof pb
         * @classdesc Represents an Element2D.
         * @implements IElement2D
         * @constructor
         * @param {pb.IElement2D=} [properties] Properties to set
         */
        function Element2D(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Element2D uid.
         * @member {number} uid
         * @memberof pb.Element2D
         * @instance
         */
        Element2D.prototype.uid = 0;

        /**
         * Element2D group.
         * @member {pb.Element2D.IGroup|null|undefined} group
         * @memberof pb.Element2D
         * @instance
         */
        Element2D.prototype.group = null;

        /**
         * Element2D point.
         * @member {pb.Element2D.IVector|null|undefined} point
         * @memberof pb.Element2D
         * @instance
         */
        Element2D.prototype.point = null;

        /**
         * Element2D segment.
         * @member {pb.Element2D.ISegment|null|undefined} segment
         * @memberof pb.Element2D
         * @instance
         */
        Element2D.prototype.segment = null;

        /**
         * Element2D arc.
         * @member {pb.Element2D.IArc|null|undefined} arc
         * @memberof pb.Element2D
         * @instance
         */
        Element2D.prototype.arc = null;

        /**
         * Creates a new Element2D instance using the specified properties.
         * @function create
         * @memberof pb.Element2D
         * @static
         * @param {pb.IElement2D=} [properties] Properties to set
         * @returns {pb.Element2D} Element2D instance
         */
        Element2D.create = function create(properties) {
            return new Element2D(properties);
        };

        /**
         * Encodes the specified Element2D message. Does not implicitly {@link pb.Element2D.verify|verify} messages.
         * @function encode
         * @memberof pb.Element2D
         * @static
         * @param {pb.IElement2D} message Element2D message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Element2D.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.uid != null && message.hasOwnProperty("uid"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.uid);
            if (message.group != null && message.hasOwnProperty("group"))
                $root.pb.Element2D.Group.encode(message.group, writer.uint32(/* id 100, wireType 2 =*/802).fork()).ldelim();
            if (message.point != null && message.hasOwnProperty("point"))
                $root.pb.Element2D.Vector.encode(message.point, writer.uint32(/* id 101, wireType 2 =*/810).fork()).ldelim();
            if (message.segment != null && message.hasOwnProperty("segment"))
                $root.pb.Element2D.Segment.encode(message.segment, writer.uint32(/* id 102, wireType 2 =*/818).fork()).ldelim();
            if (message.arc != null && message.hasOwnProperty("arc"))
                $root.pb.Element2D.Arc.encode(message.arc, writer.uint32(/* id 103, wireType 2 =*/826).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Element2D message, length delimited. Does not implicitly {@link pb.Element2D.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Element2D
         * @static
         * @param {pb.IElement2D} message Element2D message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Element2D.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Element2D message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Element2D
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Element2D} Element2D
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Element2D.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Element2D();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.uid = reader.int32();
                    break;
                case 100:
                    message.group = $root.pb.Element2D.Group.decode(reader, reader.uint32());
                    break;
                case 101:
                    message.point = $root.pb.Element2D.Vector.decode(reader, reader.uint32());
                    break;
                case 102:
                    message.segment = $root.pb.Element2D.Segment.decode(reader, reader.uint32());
                    break;
                case 103:
                    message.arc = $root.pb.Element2D.Arc.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Element2D message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Element2D
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Element2D} Element2D
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Element2D.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Element2D message.
         * @function verify
         * @memberof pb.Element2D
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Element2D.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.uid != null && message.hasOwnProperty("uid"))
                if (!$util.isInteger(message.uid))
                    return "uid: integer expected";
            if (message.group != null && message.hasOwnProperty("group")) {
                var error = $root.pb.Element2D.Group.verify(message.group);
                if (error)
                    return "group." + error;
            }
            if (message.point != null && message.hasOwnProperty("point")) {
                var error = $root.pb.Element2D.Vector.verify(message.point);
                if (error)
                    return "point." + error;
            }
            if (message.segment != null && message.hasOwnProperty("segment")) {
                var error = $root.pb.Element2D.Segment.verify(message.segment);
                if (error)
                    return "segment." + error;
            }
            if (message.arc != null && message.hasOwnProperty("arc")) {
                var error = $root.pb.Element2D.Arc.verify(message.arc);
                if (error)
                    return "arc." + error;
            }
            return null;
        };

        /**
         * Creates an Element2D message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Element2D
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Element2D} Element2D
         */
        Element2D.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Element2D)
                return object;
            var message = new $root.pb.Element2D();
            if (object.uid != null)
                message.uid = object.uid | 0;
            if (object.group != null) {
                if (typeof object.group !== "object")
                    throw TypeError(".pb.Element2D.group: object expected");
                message.group = $root.pb.Element2D.Group.fromObject(object.group);
            }
            if (object.point != null) {
                if (typeof object.point !== "object")
                    throw TypeError(".pb.Element2D.point: object expected");
                message.point = $root.pb.Element2D.Vector.fromObject(object.point);
            }
            if (object.segment != null) {
                if (typeof object.segment !== "object")
                    throw TypeError(".pb.Element2D.segment: object expected");
                message.segment = $root.pb.Element2D.Segment.fromObject(object.segment);
            }
            if (object.arc != null) {
                if (typeof object.arc !== "object")
                    throw TypeError(".pb.Element2D.arc: object expected");
                message.arc = $root.pb.Element2D.Arc.fromObject(object.arc);
            }
            return message;
        };

        /**
         * Creates a plain object from an Element2D message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Element2D
         * @static
         * @param {pb.Element2D} message Element2D
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Element2D.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.uid = 0;
                object.group = null;
                object.point = null;
                object.segment = null;
                object.arc = null;
            }
            if (message.uid != null && message.hasOwnProperty("uid"))
                object.uid = message.uid;
            if (message.group != null && message.hasOwnProperty("group"))
                object.group = $root.pb.Element2D.Group.toObject(message.group, options);
            if (message.point != null && message.hasOwnProperty("point"))
                object.point = $root.pb.Element2D.Vector.toObject(message.point, options);
            if (message.segment != null && message.hasOwnProperty("segment"))
                object.segment = $root.pb.Element2D.Segment.toObject(message.segment, options);
            if (message.arc != null && message.hasOwnProperty("arc"))
                object.arc = $root.pb.Element2D.Arc.toObject(message.arc, options);
            return object;
        };

        /**
         * Converts this Element2D to JSON.
         * @function toJSON
         * @memberof pb.Element2D
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Element2D.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Element2D.Vector = (function() {

            /**
             * Properties of a Vector.
             * @memberof pb.Element2D
             * @interface IVector
             * @property {number|null} [x] Vector x
             * @property {number|null} [y] Vector y
             */

            /**
             * Constructs a new Vector.
             * @memberof pb.Element2D
             * @classdesc Represents a Vector.
             * @implements IVector
             * @constructor
             * @param {pb.Element2D.IVector=} [properties] Properties to set
             */
            function Vector(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Vector x.
             * @member {number} x
             * @memberof pb.Element2D.Vector
             * @instance
             */
            Vector.prototype.x = 0;

            /**
             * Vector y.
             * @member {number} y
             * @memberof pb.Element2D.Vector
             * @instance
             */
            Vector.prototype.y = 0;

            /**
             * Creates a new Vector instance using the specified properties.
             * @function create
             * @memberof pb.Element2D.Vector
             * @static
             * @param {pb.Element2D.IVector=} [properties] Properties to set
             * @returns {pb.Element2D.Vector} Vector instance
             */
            Vector.create = function create(properties) {
                return new Vector(properties);
            };

            /**
             * Encodes the specified Vector message. Does not implicitly {@link pb.Element2D.Vector.verify|verify} messages.
             * @function encode
             * @memberof pb.Element2D.Vector
             * @static
             * @param {pb.Element2D.IVector} message Vector message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Vector.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.x != null && message.hasOwnProperty("x"))
                    writer.uint32(/* id 1, wireType 1 =*/9).double(message.x);
                if (message.y != null && message.hasOwnProperty("y"))
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.y);
                return writer;
            };

            /**
             * Encodes the specified Vector message, length delimited. Does not implicitly {@link pb.Element2D.Vector.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Element2D.Vector
             * @static
             * @param {pb.Element2D.IVector} message Vector message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Vector.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Vector message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Element2D.Vector
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Element2D.Vector} Vector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Vector.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Element2D.Vector();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.x = reader.double();
                        break;
                    case 2:
                        message.y = reader.double();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Vector message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Element2D.Vector
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Element2D.Vector} Vector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Vector.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Vector message.
             * @function verify
             * @memberof pb.Element2D.Vector
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Vector.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.x != null && message.hasOwnProperty("x"))
                    if (typeof message.x !== "number")
                        return "x: number expected";
                if (message.y != null && message.hasOwnProperty("y"))
                    if (typeof message.y !== "number")
                        return "y: number expected";
                return null;
            };

            /**
             * Creates a Vector message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Element2D.Vector
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Element2D.Vector} Vector
             */
            Vector.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Element2D.Vector)
                    return object;
                var message = new $root.pb.Element2D.Vector();
                if (object.x != null)
                    message.x = Number(object.x);
                if (object.y != null)
                    message.y = Number(object.y);
                return message;
            };

            /**
             * Creates a plain object from a Vector message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Element2D.Vector
             * @static
             * @param {pb.Element2D.Vector} message Vector
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Vector.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.x = 0;
                    object.y = 0;
                }
                if (message.x != null && message.hasOwnProperty("x"))
                    object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
                if (message.y != null && message.hasOwnProperty("y"))
                    object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
                return object;
            };

            /**
             * Converts this Vector to JSON.
             * @function toJSON
             * @memberof pb.Element2D.Vector
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Vector.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Vector;
        })();

        Element2D.Segment = (function() {

            /**
             * Properties of a Segment.
             * @memberof pb.Element2D
             * @interface ISegment
             * @property {pb.Element2D.IVector|null} [p1] Segment p1
             * @property {pb.Element2D.IVector|null} [p2] Segment p2
             */

            /**
             * Constructs a new Segment.
             * @memberof pb.Element2D
             * @classdesc Represents a Segment.
             * @implements ISegment
             * @constructor
             * @param {pb.Element2D.ISegment=} [properties] Properties to set
             */
            function Segment(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Segment p1.
             * @member {pb.Element2D.IVector|null|undefined} p1
             * @memberof pb.Element2D.Segment
             * @instance
             */
            Segment.prototype.p1 = null;

            /**
             * Segment p2.
             * @member {pb.Element2D.IVector|null|undefined} p2
             * @memberof pb.Element2D.Segment
             * @instance
             */
            Segment.prototype.p2 = null;

            /**
             * Creates a new Segment instance using the specified properties.
             * @function create
             * @memberof pb.Element2D.Segment
             * @static
             * @param {pb.Element2D.ISegment=} [properties] Properties to set
             * @returns {pb.Element2D.Segment} Segment instance
             */
            Segment.create = function create(properties) {
                return new Segment(properties);
            };

            /**
             * Encodes the specified Segment message. Does not implicitly {@link pb.Element2D.Segment.verify|verify} messages.
             * @function encode
             * @memberof pb.Element2D.Segment
             * @static
             * @param {pb.Element2D.ISegment} message Segment message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Segment.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.p1 != null && message.hasOwnProperty("p1"))
                    $root.pb.Element2D.Vector.encode(message.p1, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.p2 != null && message.hasOwnProperty("p2"))
                    $root.pb.Element2D.Vector.encode(message.p2, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Segment message, length delimited. Does not implicitly {@link pb.Element2D.Segment.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Element2D.Segment
             * @static
             * @param {pb.Element2D.ISegment} message Segment message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Segment.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Segment message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Element2D.Segment
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Element2D.Segment} Segment
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Segment.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Element2D.Segment();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.p1 = $root.pb.Element2D.Vector.decode(reader, reader.uint32());
                        break;
                    case 2:
                        message.p2 = $root.pb.Element2D.Vector.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Segment message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Element2D.Segment
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Element2D.Segment} Segment
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Segment.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Segment message.
             * @function verify
             * @memberof pb.Element2D.Segment
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Segment.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.p1 != null && message.hasOwnProperty("p1")) {
                    var error = $root.pb.Element2D.Vector.verify(message.p1);
                    if (error)
                        return "p1." + error;
                }
                if (message.p2 != null && message.hasOwnProperty("p2")) {
                    var error = $root.pb.Element2D.Vector.verify(message.p2);
                    if (error)
                        return "p2." + error;
                }
                return null;
            };

            /**
             * Creates a Segment message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Element2D.Segment
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Element2D.Segment} Segment
             */
            Segment.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Element2D.Segment)
                    return object;
                var message = new $root.pb.Element2D.Segment();
                if (object.p1 != null) {
                    if (typeof object.p1 !== "object")
                        throw TypeError(".pb.Element2D.Segment.p1: object expected");
                    message.p1 = $root.pb.Element2D.Vector.fromObject(object.p1);
                }
                if (object.p2 != null) {
                    if (typeof object.p2 !== "object")
                        throw TypeError(".pb.Element2D.Segment.p2: object expected");
                    message.p2 = $root.pb.Element2D.Vector.fromObject(object.p2);
                }
                return message;
            };

            /**
             * Creates a plain object from a Segment message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Element2D.Segment
             * @static
             * @param {pb.Element2D.Segment} message Segment
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Segment.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.p1 = null;
                    object.p2 = null;
                }
                if (message.p1 != null && message.hasOwnProperty("p1"))
                    object.p1 = $root.pb.Element2D.Vector.toObject(message.p1, options);
                if (message.p2 != null && message.hasOwnProperty("p2"))
                    object.p2 = $root.pb.Element2D.Vector.toObject(message.p2, options);
                return object;
            };

            /**
             * Converts this Segment to JSON.
             * @function toJSON
             * @memberof pb.Element2D.Segment
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Segment.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Segment;
        })();

        Element2D.Arc = (function() {

            /**
             * Properties of an Arc.
             * @memberof pb.Element2D
             * @interface IArc
             * @property {pb.Element2D.IVector|null} [center] Arc center
             * @property {pb.Element2D.IVector|null} [axisx] Arc axisx
             * @property {pb.Element2D.IVector|null} [axisy] Arc axisy
             * @property {number|null} [angle1] Arc angle1
             * @property {number|null} [angle2] Arc angle2
             * @property {number|null} [radiusa] Arc radiusa
             * @property {number|null} [radiusb] Arc radiusb
             * @property {boolean|null} [sense] Arc sense
             */

            /**
             * Constructs a new Arc.
             * @memberof pb.Element2D
             * @classdesc Represents an Arc.
             * @implements IArc
             * @constructor
             * @param {pb.Element2D.IArc=} [properties] Properties to set
             */
            function Arc(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Arc center.
             * @member {pb.Element2D.IVector|null|undefined} center
             * @memberof pb.Element2D.Arc
             * @instance
             */
            Arc.prototype.center = null;

            /**
             * Arc axisx.
             * @member {pb.Element2D.IVector|null|undefined} axisx
             * @memberof pb.Element2D.Arc
             * @instance
             */
            Arc.prototype.axisx = null;

            /**
             * Arc axisy.
             * @member {pb.Element2D.IVector|null|undefined} axisy
             * @memberof pb.Element2D.Arc
             * @instance
             */
            Arc.prototype.axisy = null;

            /**
             * Arc angle1.
             * @member {number} angle1
             * @memberof pb.Element2D.Arc
             * @instance
             */
            Arc.prototype.angle1 = 0;

            /**
             * Arc angle2.
             * @member {number} angle2
             * @memberof pb.Element2D.Arc
             * @instance
             */
            Arc.prototype.angle2 = 0;

            /**
             * Arc radiusa.
             * @member {number} radiusa
             * @memberof pb.Element2D.Arc
             * @instance
             */
            Arc.prototype.radiusa = 0;

            /**
             * Arc radiusb.
             * @member {number} radiusb
             * @memberof pb.Element2D.Arc
             * @instance
             */
            Arc.prototype.radiusb = 0;

            /**
             * Arc sense.
             * @member {boolean} sense
             * @memberof pb.Element2D.Arc
             * @instance
             */
            Arc.prototype.sense = false;

            /**
             * Creates a new Arc instance using the specified properties.
             * @function create
             * @memberof pb.Element2D.Arc
             * @static
             * @param {pb.Element2D.IArc=} [properties] Properties to set
             * @returns {pb.Element2D.Arc} Arc instance
             */
            Arc.create = function create(properties) {
                return new Arc(properties);
            };

            /**
             * Encodes the specified Arc message. Does not implicitly {@link pb.Element2D.Arc.verify|verify} messages.
             * @function encode
             * @memberof pb.Element2D.Arc
             * @static
             * @param {pb.Element2D.IArc} message Arc message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Arc.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.center != null && message.hasOwnProperty("center"))
                    $root.pb.Element2D.Vector.encode(message.center, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.axisx != null && message.hasOwnProperty("axisx"))
                    $root.pb.Element2D.Vector.encode(message.axisx, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.axisy != null && message.hasOwnProperty("axisy"))
                    $root.pb.Element2D.Vector.encode(message.axisy, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.angle1 != null && message.hasOwnProperty("angle1"))
                    writer.uint32(/* id 4, wireType 1 =*/33).double(message.angle1);
                if (message.angle2 != null && message.hasOwnProperty("angle2"))
                    writer.uint32(/* id 5, wireType 1 =*/41).double(message.angle2);
                if (message.radiusa != null && message.hasOwnProperty("radiusa"))
                    writer.uint32(/* id 6, wireType 1 =*/49).double(message.radiusa);
                if (message.radiusb != null && message.hasOwnProperty("radiusb"))
                    writer.uint32(/* id 7, wireType 1 =*/57).double(message.radiusb);
                if (message.sense != null && message.hasOwnProperty("sense"))
                    writer.uint32(/* id 8, wireType 0 =*/64).bool(message.sense);
                return writer;
            };

            /**
             * Encodes the specified Arc message, length delimited. Does not implicitly {@link pb.Element2D.Arc.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Element2D.Arc
             * @static
             * @param {pb.Element2D.IArc} message Arc message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Arc.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Arc message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Element2D.Arc
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Element2D.Arc} Arc
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Arc.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Element2D.Arc();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.center = $root.pb.Element2D.Vector.decode(reader, reader.uint32());
                        break;
                    case 2:
                        message.axisx = $root.pb.Element2D.Vector.decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.axisy = $root.pb.Element2D.Vector.decode(reader, reader.uint32());
                        break;
                    case 4:
                        message.angle1 = reader.double();
                        break;
                    case 5:
                        message.angle2 = reader.double();
                        break;
                    case 6:
                        message.radiusa = reader.double();
                        break;
                    case 7:
                        message.radiusb = reader.double();
                        break;
                    case 8:
                        message.sense = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Arc message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Element2D.Arc
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Element2D.Arc} Arc
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Arc.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Arc message.
             * @function verify
             * @memberof pb.Element2D.Arc
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Arc.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.center != null && message.hasOwnProperty("center")) {
                    var error = $root.pb.Element2D.Vector.verify(message.center);
                    if (error)
                        return "center." + error;
                }
                if (message.axisx != null && message.hasOwnProperty("axisx")) {
                    var error = $root.pb.Element2D.Vector.verify(message.axisx);
                    if (error)
                        return "axisx." + error;
                }
                if (message.axisy != null && message.hasOwnProperty("axisy")) {
                    var error = $root.pb.Element2D.Vector.verify(message.axisy);
                    if (error)
                        return "axisy." + error;
                }
                if (message.angle1 != null && message.hasOwnProperty("angle1"))
                    if (typeof message.angle1 !== "number")
                        return "angle1: number expected";
                if (message.angle2 != null && message.hasOwnProperty("angle2"))
                    if (typeof message.angle2 !== "number")
                        return "angle2: number expected";
                if (message.radiusa != null && message.hasOwnProperty("radiusa"))
                    if (typeof message.radiusa !== "number")
                        return "radiusa: number expected";
                if (message.radiusb != null && message.hasOwnProperty("radiusb"))
                    if (typeof message.radiusb !== "number")
                        return "radiusb: number expected";
                if (message.sense != null && message.hasOwnProperty("sense"))
                    if (typeof message.sense !== "boolean")
                        return "sense: boolean expected";
                return null;
            };

            /**
             * Creates an Arc message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Element2D.Arc
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Element2D.Arc} Arc
             */
            Arc.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Element2D.Arc)
                    return object;
                var message = new $root.pb.Element2D.Arc();
                if (object.center != null) {
                    if (typeof object.center !== "object")
                        throw TypeError(".pb.Element2D.Arc.center: object expected");
                    message.center = $root.pb.Element2D.Vector.fromObject(object.center);
                }
                if (object.axisx != null) {
                    if (typeof object.axisx !== "object")
                        throw TypeError(".pb.Element2D.Arc.axisx: object expected");
                    message.axisx = $root.pb.Element2D.Vector.fromObject(object.axisx);
                }
                if (object.axisy != null) {
                    if (typeof object.axisy !== "object")
                        throw TypeError(".pb.Element2D.Arc.axisy: object expected");
                    message.axisy = $root.pb.Element2D.Vector.fromObject(object.axisy);
                }
                if (object.angle1 != null)
                    message.angle1 = Number(object.angle1);
                if (object.angle2 != null)
                    message.angle2 = Number(object.angle2);
                if (object.radiusa != null)
                    message.radiusa = Number(object.radiusa);
                if (object.radiusb != null)
                    message.radiusb = Number(object.radiusb);
                if (object.sense != null)
                    message.sense = Boolean(object.sense);
                return message;
            };

            /**
             * Creates a plain object from an Arc message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Element2D.Arc
             * @static
             * @param {pb.Element2D.Arc} message Arc
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Arc.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.center = null;
                    object.axisx = null;
                    object.axisy = null;
                    object.angle1 = 0;
                    object.angle2 = 0;
                    object.radiusa = 0;
                    object.radiusb = 0;
                    object.sense = false;
                }
                if (message.center != null && message.hasOwnProperty("center"))
                    object.center = $root.pb.Element2D.Vector.toObject(message.center, options);
                if (message.axisx != null && message.hasOwnProperty("axisx"))
                    object.axisx = $root.pb.Element2D.Vector.toObject(message.axisx, options);
                if (message.axisy != null && message.hasOwnProperty("axisy"))
                    object.axisy = $root.pb.Element2D.Vector.toObject(message.axisy, options);
                if (message.angle1 != null && message.hasOwnProperty("angle1"))
                    object.angle1 = options.json && !isFinite(message.angle1) ? String(message.angle1) : message.angle1;
                if (message.angle2 != null && message.hasOwnProperty("angle2"))
                    object.angle2 = options.json && !isFinite(message.angle2) ? String(message.angle2) : message.angle2;
                if (message.radiusa != null && message.hasOwnProperty("radiusa"))
                    object.radiusa = options.json && !isFinite(message.radiusa) ? String(message.radiusa) : message.radiusa;
                if (message.radiusb != null && message.hasOwnProperty("radiusb"))
                    object.radiusb = options.json && !isFinite(message.radiusb) ? String(message.radiusb) : message.radiusb;
                if (message.sense != null && message.hasOwnProperty("sense"))
                    object.sense = message.sense;
                return object;
            };

            /**
             * Converts this Arc to JSON.
             * @function toJSON
             * @memberof pb.Element2D.Arc
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Arc.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Arc;
        })();

        Element2D.Group = (function() {

            /**
             * Properties of a Group.
             * @memberof pb.Element2D
             * @interface IGroup
             * @property {Array.<pb.IElement2D>|null} [item] Group item
             */

            /**
             * Constructs a new Group.
             * @memberof pb.Element2D
             * @classdesc Represents a Group.
             * @implements IGroup
             * @constructor
             * @param {pb.Element2D.IGroup=} [properties] Properties to set
             */
            function Group(properties) {
                this.item = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Group item.
             * @member {Array.<pb.IElement2D>} item
             * @memberof pb.Element2D.Group
             * @instance
             */
            Group.prototype.item = $util.emptyArray;

            /**
             * Creates a new Group instance using the specified properties.
             * @function create
             * @memberof pb.Element2D.Group
             * @static
             * @param {pb.Element2D.IGroup=} [properties] Properties to set
             * @returns {pb.Element2D.Group} Group instance
             */
            Group.create = function create(properties) {
                return new Group(properties);
            };

            /**
             * Encodes the specified Group message. Does not implicitly {@link pb.Element2D.Group.verify|verify} messages.
             * @function encode
             * @memberof pb.Element2D.Group
             * @static
             * @param {pb.Element2D.IGroup} message Group message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Group.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.item != null && message.item.length)
                    for (var i = 0; i < message.item.length; ++i)
                        $root.pb.Element2D.encode(message.item[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Group message, length delimited. Does not implicitly {@link pb.Element2D.Group.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Element2D.Group
             * @static
             * @param {pb.Element2D.IGroup} message Group message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Group.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Group message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Element2D.Group
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Element2D.Group} Group
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Group.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Element2D.Group();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.item && message.item.length))
                            message.item = [];
                        message.item.push($root.pb.Element2D.decode(reader, reader.uint32()));
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Group message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Element2D.Group
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Element2D.Group} Group
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Group.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Group message.
             * @function verify
             * @memberof pb.Element2D.Group
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Group.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.item != null && message.hasOwnProperty("item")) {
                    if (!Array.isArray(message.item))
                        return "item: array expected";
                    for (var i = 0; i < message.item.length; ++i) {
                        var error = $root.pb.Element2D.verify(message.item[i]);
                        if (error)
                            return "item." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Group message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Element2D.Group
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Element2D.Group} Group
             */
            Group.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Element2D.Group)
                    return object;
                var message = new $root.pb.Element2D.Group();
                if (object.item) {
                    if (!Array.isArray(object.item))
                        throw TypeError(".pb.Element2D.Group.item: array expected");
                    message.item = [];
                    for (var i = 0; i < object.item.length; ++i) {
                        if (typeof object.item[i] !== "object")
                            throw TypeError(".pb.Element2D.Group.item: object expected");
                        message.item[i] = $root.pb.Element2D.fromObject(object.item[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Group message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Element2D.Group
             * @static
             * @param {pb.Element2D.Group} message Group
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Group.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.item = [];
                if (message.item && message.item.length) {
                    object.item = [];
                    for (var j = 0; j < message.item.length; ++j)
                        object.item[j] = $root.pb.Element2D.toObject(message.item[j], options);
                }
                return object;
            };

            /**
             * Converts this Group to JSON.
             * @function toJSON
             * @memberof pb.Element2D.Group
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Group.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Group;
        })();

        return Element2D;
    })();

    pb.BuilderOperationList = (function() {

        /**
         * Properties of a BuilderOperationList.
         * @memberof pb
         * @interface IBuilderOperationList
         * @property {Array.<pb.IOperation>|null} [operation] BuilderOperationList operation
         */

        /**
         * Constructs a new BuilderOperationList.
         * @memberof pb
         * @classdesc Represents a BuilderOperationList.
         * @implements IBuilderOperationList
         * @constructor
         * @param {pb.IBuilderOperationList=} [properties] Properties to set
         */
        function BuilderOperationList(properties) {
            this.operation = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BuilderOperationList operation.
         * @member {Array.<pb.IOperation>} operation
         * @memberof pb.BuilderOperationList
         * @instance
         */
        BuilderOperationList.prototype.operation = $util.emptyArray;

        /**
         * Creates a new BuilderOperationList instance using the specified properties.
         * @function create
         * @memberof pb.BuilderOperationList
         * @static
         * @param {pb.IBuilderOperationList=} [properties] Properties to set
         * @returns {pb.BuilderOperationList} BuilderOperationList instance
         */
        BuilderOperationList.create = function create(properties) {
            return new BuilderOperationList(properties);
        };

        /**
         * Encodes the specified BuilderOperationList message. Does not implicitly {@link pb.BuilderOperationList.verify|verify} messages.
         * @function encode
         * @memberof pb.BuilderOperationList
         * @static
         * @param {pb.IBuilderOperationList} message BuilderOperationList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BuilderOperationList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.operation != null && message.operation.length)
                for (var i = 0; i < message.operation.length; ++i)
                    $root.pb.Operation.encode(message.operation[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified BuilderOperationList message, length delimited. Does not implicitly {@link pb.BuilderOperationList.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.BuilderOperationList
         * @static
         * @param {pb.IBuilderOperationList} message BuilderOperationList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BuilderOperationList.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BuilderOperationList message from the specified reader or buffer.
         * @function decode
         * @memberof pb.BuilderOperationList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.BuilderOperationList} BuilderOperationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BuilderOperationList.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.BuilderOperationList();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.operation && message.operation.length))
                        message.operation = [];
                    message.operation.push($root.pb.Operation.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a BuilderOperationList message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.BuilderOperationList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.BuilderOperationList} BuilderOperationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BuilderOperationList.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BuilderOperationList message.
         * @function verify
         * @memberof pb.BuilderOperationList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BuilderOperationList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.operation != null && message.hasOwnProperty("operation")) {
                if (!Array.isArray(message.operation))
                    return "operation: array expected";
                for (var i = 0; i < message.operation.length; ++i) {
                    var error = $root.pb.Operation.verify(message.operation[i]);
                    if (error)
                        return "operation." + error;
                }
            }
            return null;
        };

        /**
         * Creates a BuilderOperationList message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.BuilderOperationList
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.BuilderOperationList} BuilderOperationList
         */
        BuilderOperationList.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.BuilderOperationList)
                return object;
            var message = new $root.pb.BuilderOperationList();
            if (object.operation) {
                if (!Array.isArray(object.operation))
                    throw TypeError(".pb.BuilderOperationList.operation: array expected");
                message.operation = [];
                for (var i = 0; i < object.operation.length; ++i) {
                    if (typeof object.operation[i] !== "object")
                        throw TypeError(".pb.BuilderOperationList.operation: object expected");
                    message.operation[i] = $root.pb.Operation.fromObject(object.operation[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a BuilderOperationList message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.BuilderOperationList
         * @static
         * @param {pb.BuilderOperationList} message BuilderOperationList
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BuilderOperationList.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.operation = [];
            if (message.operation && message.operation.length) {
                object.operation = [];
                for (var j = 0; j < message.operation.length; ++j)
                    object.operation[j] = $root.pb.Operation.toObject(message.operation[j], options);
            }
            return object;
        };

        /**
         * Converts this BuilderOperationList to JSON.
         * @function toJSON
         * @memberof pb.BuilderOperationList
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BuilderOperationList.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return BuilderOperationList;
    })();

    pb.Builder = (function() {

        /**
         * Properties of a Builder.
         * @memberof pb
         * @interface IBuilder
         * @property {pb.IMaterial|null} [material] Builder material
         * @property {pb.IBuilderOperationList|null} [operations] Builder operations
         * @property {pb.Builder.IPanel|null} [panel] Builder panel
         * @property {pb.Builder.IProfile|null} [profile] Builder profile
         * @property {pb.Builder.IRotation|null} [rotation] Builder rotation
         * @property {pb.Builder.ISolid|null} [solid] Builder solid
         */

        /**
         * Constructs a new Builder.
         * @memberof pb
         * @classdesc Represents a Builder.
         * @implements IBuilder
         * @constructor
         * @param {pb.IBuilder=} [properties] Properties to set
         */
        function Builder(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Builder material.
         * @member {pb.IMaterial|null|undefined} material
         * @memberof pb.Builder
         * @instance
         */
        Builder.prototype.material = null;

        /**
         * Builder operations.
         * @member {pb.IBuilderOperationList|null|undefined} operations
         * @memberof pb.Builder
         * @instance
         */
        Builder.prototype.operations = null;

        /**
         * Builder panel.
         * @member {pb.Builder.IPanel|null|undefined} panel
         * @memberof pb.Builder
         * @instance
         */
        Builder.prototype.panel = null;

        /**
         * Builder profile.
         * @member {pb.Builder.IProfile|null|undefined} profile
         * @memberof pb.Builder
         * @instance
         */
        Builder.prototype.profile = null;

        /**
         * Builder rotation.
         * @member {pb.Builder.IRotation|null|undefined} rotation
         * @memberof pb.Builder
         * @instance
         */
        Builder.prototype.rotation = null;

        /**
         * Builder solid.
         * @member {pb.Builder.ISolid|null|undefined} solid
         * @memberof pb.Builder
         * @instance
         */
        Builder.prototype.solid = null;

        /**
         * Creates a new Builder instance using the specified properties.
         * @function create
         * @memberof pb.Builder
         * @static
         * @param {pb.IBuilder=} [properties] Properties to set
         * @returns {pb.Builder} Builder instance
         */
        Builder.create = function create(properties) {
            return new Builder(properties);
        };

        /**
         * Encodes the specified Builder message. Does not implicitly {@link pb.Builder.verify|verify} messages.
         * @function encode
         * @memberof pb.Builder
         * @static
         * @param {pb.IBuilder} message Builder message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Builder.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.material != null && message.hasOwnProperty("material"))
                $root.pb.Material.encode(message.material, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.operations != null && message.hasOwnProperty("operations"))
                $root.pb.BuilderOperationList.encode(message.operations, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.panel != null && message.hasOwnProperty("panel"))
                $root.pb.Builder.Panel.encode(message.panel, writer.uint32(/* id 100, wireType 2 =*/802).fork()).ldelim();
            if (message.profile != null && message.hasOwnProperty("profile"))
                $root.pb.Builder.Profile.encode(message.profile, writer.uint32(/* id 101, wireType 2 =*/810).fork()).ldelim();
            if (message.rotation != null && message.hasOwnProperty("rotation"))
                $root.pb.Builder.Rotation.encode(message.rotation, writer.uint32(/* id 102, wireType 2 =*/818).fork()).ldelim();
            if (message.solid != null && message.hasOwnProperty("solid"))
                $root.pb.Builder.Solid.encode(message.solid, writer.uint32(/* id 103, wireType 2 =*/826).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Builder message, length delimited. Does not implicitly {@link pb.Builder.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Builder
         * @static
         * @param {pb.IBuilder} message Builder message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Builder.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Builder message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Builder
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Builder} Builder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Builder.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Builder();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.material = $root.pb.Material.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.operations = $root.pb.BuilderOperationList.decode(reader, reader.uint32());
                    break;
                case 100:
                    message.panel = $root.pb.Builder.Panel.decode(reader, reader.uint32());
                    break;
                case 101:
                    message.profile = $root.pb.Builder.Profile.decode(reader, reader.uint32());
                    break;
                case 102:
                    message.rotation = $root.pb.Builder.Rotation.decode(reader, reader.uint32());
                    break;
                case 103:
                    message.solid = $root.pb.Builder.Solid.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Builder message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Builder
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Builder} Builder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Builder.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Builder message.
         * @function verify
         * @memberof pb.Builder
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Builder.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.material != null && message.hasOwnProperty("material")) {
                var error = $root.pb.Material.verify(message.material);
                if (error)
                    return "material." + error;
            }
            if (message.operations != null && message.hasOwnProperty("operations")) {
                var error = $root.pb.BuilderOperationList.verify(message.operations);
                if (error)
                    return "operations." + error;
            }
            if (message.panel != null && message.hasOwnProperty("panel")) {
                var error = $root.pb.Builder.Panel.verify(message.panel);
                if (error)
                    return "panel." + error;
            }
            if (message.profile != null && message.hasOwnProperty("profile")) {
                var error = $root.pb.Builder.Profile.verify(message.profile);
                if (error)
                    return "profile." + error;
            }
            if (message.rotation != null && message.hasOwnProperty("rotation")) {
                var error = $root.pb.Builder.Rotation.verify(message.rotation);
                if (error)
                    return "rotation." + error;
            }
            if (message.solid != null && message.hasOwnProperty("solid")) {
                var error = $root.pb.Builder.Solid.verify(message.solid);
                if (error)
                    return "solid." + error;
            }
            return null;
        };

        /**
         * Creates a Builder message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Builder
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Builder} Builder
         */
        Builder.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Builder)
                return object;
            var message = new $root.pb.Builder();
            if (object.material != null) {
                if (typeof object.material !== "object")
                    throw TypeError(".pb.Builder.material: object expected");
                message.material = $root.pb.Material.fromObject(object.material);
            }
            if (object.operations != null) {
                if (typeof object.operations !== "object")
                    throw TypeError(".pb.Builder.operations: object expected");
                message.operations = $root.pb.BuilderOperationList.fromObject(object.operations);
            }
            if (object.panel != null) {
                if (typeof object.panel !== "object")
                    throw TypeError(".pb.Builder.panel: object expected");
                message.panel = $root.pb.Builder.Panel.fromObject(object.panel);
            }
            if (object.profile != null) {
                if (typeof object.profile !== "object")
                    throw TypeError(".pb.Builder.profile: object expected");
                message.profile = $root.pb.Builder.Profile.fromObject(object.profile);
            }
            if (object.rotation != null) {
                if (typeof object.rotation !== "object")
                    throw TypeError(".pb.Builder.rotation: object expected");
                message.rotation = $root.pb.Builder.Rotation.fromObject(object.rotation);
            }
            if (object.solid != null) {
                if (typeof object.solid !== "object")
                    throw TypeError(".pb.Builder.solid: object expected");
                message.solid = $root.pb.Builder.Solid.fromObject(object.solid);
            }
            return message;
        };

        /**
         * Creates a plain object from a Builder message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Builder
         * @static
         * @param {pb.Builder} message Builder
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Builder.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.material = null;
                object.operations = null;
                object.panel = null;
                object.profile = null;
                object.rotation = null;
                object.solid = null;
            }
            if (message.material != null && message.hasOwnProperty("material"))
                object.material = $root.pb.Material.toObject(message.material, options);
            if (message.operations != null && message.hasOwnProperty("operations"))
                object.operations = $root.pb.BuilderOperationList.toObject(message.operations, options);
            if (message.panel != null && message.hasOwnProperty("panel"))
                object.panel = $root.pb.Builder.Panel.toObject(message.panel, options);
            if (message.profile != null && message.hasOwnProperty("profile"))
                object.profile = $root.pb.Builder.Profile.toObject(message.profile, options);
            if (message.rotation != null && message.hasOwnProperty("rotation"))
                object.rotation = $root.pb.Builder.Rotation.toObject(message.rotation, options);
            if (message.solid != null && message.hasOwnProperty("solid"))
                object.solid = $root.pb.Builder.Solid.toObject(message.solid, options);
            return object;
        };

        /**
         * Converts this Builder to JSON.
         * @function toJSON
         * @memberof pb.Builder
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Builder.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Builder.Panel = (function() {

            /**
             * Properties of a Panel.
             * @memberof pb.Builder
             * @interface IPanel
             * @property {pb.IElement2D|null} [contour] Panel contour
             * @property {Array.<pb.Builder.Panel.IEdge>|null} [edge] Panel edge
             * @property {Array.<pb.Builder.Panel.IPlastic>|null} [plastic] Panel plastic
             * @property {pb.IElement2D|null} [bentPath] Panel bentPath
             * @property {boolean|null} [bentDirection] Panel bentDirection
             * @property {number|null} [interlayerThickness] Panel interlayerThickness
             * @property {pb.Builder.Panel.Texture|null} [texture] Panel texture
             */

            /**
             * Constructs a new Panel.
             * @memberof pb.Builder
             * @classdesc Represents a Panel.
             * @implements IPanel
             * @constructor
             * @param {pb.Builder.IPanel=} [properties] Properties to set
             */
            function Panel(properties) {
                this.edge = [];
                this.plastic = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Panel contour.
             * @member {pb.IElement2D|null|undefined} contour
             * @memberof pb.Builder.Panel
             * @instance
             */
            Panel.prototype.contour = null;

            /**
             * Panel edge.
             * @member {Array.<pb.Builder.Panel.IEdge>} edge
             * @memberof pb.Builder.Panel
             * @instance
             */
            Panel.prototype.edge = $util.emptyArray;

            /**
             * Panel plastic.
             * @member {Array.<pb.Builder.Panel.IPlastic>} plastic
             * @memberof pb.Builder.Panel
             * @instance
             */
            Panel.prototype.plastic = $util.emptyArray;

            /**
             * Panel bentPath.
             * @member {pb.IElement2D|null|undefined} bentPath
             * @memberof pb.Builder.Panel
             * @instance
             */
            Panel.prototype.bentPath = null;

            /**
             * Panel bentDirection.
             * @member {boolean} bentDirection
             * @memberof pb.Builder.Panel
             * @instance
             */
            Panel.prototype.bentDirection = false;

            /**
             * Panel interlayerThickness.
             * @member {number} interlayerThickness
             * @memberof pb.Builder.Panel
             * @instance
             */
            Panel.prototype.interlayerThickness = 0;

            /**
             * Panel texture.
             * @member {pb.Builder.Panel.Texture} texture
             * @memberof pb.Builder.Panel
             * @instance
             */
            Panel.prototype.texture = 0;

            /**
             * Creates a new Panel instance using the specified properties.
             * @function create
             * @memberof pb.Builder.Panel
             * @static
             * @param {pb.Builder.IPanel=} [properties] Properties to set
             * @returns {pb.Builder.Panel} Panel instance
             */
            Panel.create = function create(properties) {
                return new Panel(properties);
            };

            /**
             * Encodes the specified Panel message. Does not implicitly {@link pb.Builder.Panel.verify|verify} messages.
             * @function encode
             * @memberof pb.Builder.Panel
             * @static
             * @param {pb.Builder.IPanel} message Panel message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Panel.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.contour != null && message.hasOwnProperty("contour"))
                    $root.pb.Element2D.encode(message.contour, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.edge != null && message.edge.length)
                    for (var i = 0; i < message.edge.length; ++i)
                        $root.pb.Builder.Panel.Edge.encode(message.edge[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.plastic != null && message.plastic.length)
                    for (var i = 0; i < message.plastic.length; ++i)
                        $root.pb.Builder.Panel.Plastic.encode(message.plastic[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.bentPath != null && message.hasOwnProperty("bentPath"))
                    $root.pb.Element2D.encode(message.bentPath, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.bentDirection != null && message.hasOwnProperty("bentDirection"))
                    writer.uint32(/* id 5, wireType 0 =*/40).bool(message.bentDirection);
                if (message.interlayerThickness != null && message.hasOwnProperty("interlayerThickness"))
                    writer.uint32(/* id 6, wireType 1 =*/49).double(message.interlayerThickness);
                if (message.texture != null && message.hasOwnProperty("texture"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int32(message.texture);
                return writer;
            };

            /**
             * Encodes the specified Panel message, length delimited. Does not implicitly {@link pb.Builder.Panel.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Builder.Panel
             * @static
             * @param {pb.Builder.IPanel} message Panel message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Panel.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Panel message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Builder.Panel
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Builder.Panel} Panel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Panel.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Builder.Panel();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.contour = $root.pb.Element2D.decode(reader, reader.uint32());
                        break;
                    case 2:
                        if (!(message.edge && message.edge.length))
                            message.edge = [];
                        message.edge.push($root.pb.Builder.Panel.Edge.decode(reader, reader.uint32()));
                        break;
                    case 3:
                        if (!(message.plastic && message.plastic.length))
                            message.plastic = [];
                        message.plastic.push($root.pb.Builder.Panel.Plastic.decode(reader, reader.uint32()));
                        break;
                    case 4:
                        message.bentPath = $root.pb.Element2D.decode(reader, reader.uint32());
                        break;
                    case 5:
                        message.bentDirection = reader.bool();
                        break;
                    case 6:
                        message.interlayerThickness = reader.double();
                        break;
                    case 7:
                        message.texture = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Panel message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Builder.Panel
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Builder.Panel} Panel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Panel.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Panel message.
             * @function verify
             * @memberof pb.Builder.Panel
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Panel.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.contour != null && message.hasOwnProperty("contour")) {
                    var error = $root.pb.Element2D.verify(message.contour);
                    if (error)
                        return "contour." + error;
                }
                if (message.edge != null && message.hasOwnProperty("edge")) {
                    if (!Array.isArray(message.edge))
                        return "edge: array expected";
                    for (var i = 0; i < message.edge.length; ++i) {
                        var error = $root.pb.Builder.Panel.Edge.verify(message.edge[i]);
                        if (error)
                            return "edge." + error;
                    }
                }
                if (message.plastic != null && message.hasOwnProperty("plastic")) {
                    if (!Array.isArray(message.plastic))
                        return "plastic: array expected";
                    for (var i = 0; i < message.plastic.length; ++i) {
                        var error = $root.pb.Builder.Panel.Plastic.verify(message.plastic[i]);
                        if (error)
                            return "plastic." + error;
                    }
                }
                if (message.bentPath != null && message.hasOwnProperty("bentPath")) {
                    var error = $root.pb.Element2D.verify(message.bentPath);
                    if (error)
                        return "bentPath." + error;
                }
                if (message.bentDirection != null && message.hasOwnProperty("bentDirection"))
                    if (typeof message.bentDirection !== "boolean")
                        return "bentDirection: boolean expected";
                if (message.interlayerThickness != null && message.hasOwnProperty("interlayerThickness"))
                    if (typeof message.interlayerThickness !== "number")
                        return "interlayerThickness: number expected";
                if (message.texture != null && message.hasOwnProperty("texture"))
                    switch (message.texture) {
                    default:
                        return "texture: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                return null;
            };

            /**
             * Creates a Panel message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Builder.Panel
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Builder.Panel} Panel
             */
            Panel.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Builder.Panel)
                    return object;
                var message = new $root.pb.Builder.Panel();
                if (object.contour != null) {
                    if (typeof object.contour !== "object")
                        throw TypeError(".pb.Builder.Panel.contour: object expected");
                    message.contour = $root.pb.Element2D.fromObject(object.contour);
                }
                if (object.edge) {
                    if (!Array.isArray(object.edge))
                        throw TypeError(".pb.Builder.Panel.edge: array expected");
                    message.edge = [];
                    for (var i = 0; i < object.edge.length; ++i) {
                        if (typeof object.edge[i] !== "object")
                            throw TypeError(".pb.Builder.Panel.edge: object expected");
                        message.edge[i] = $root.pb.Builder.Panel.Edge.fromObject(object.edge[i]);
                    }
                }
                if (object.plastic) {
                    if (!Array.isArray(object.plastic))
                        throw TypeError(".pb.Builder.Panel.plastic: array expected");
                    message.plastic = [];
                    for (var i = 0; i < object.plastic.length; ++i) {
                        if (typeof object.plastic[i] !== "object")
                            throw TypeError(".pb.Builder.Panel.plastic: object expected");
                        message.plastic[i] = $root.pb.Builder.Panel.Plastic.fromObject(object.plastic[i]);
                    }
                }
                if (object.bentPath != null) {
                    if (typeof object.bentPath !== "object")
                        throw TypeError(".pb.Builder.Panel.bentPath: object expected");
                    message.bentPath = $root.pb.Element2D.fromObject(object.bentPath);
                }
                if (object.bentDirection != null)
                    message.bentDirection = Boolean(object.bentDirection);
                if (object.interlayerThickness != null)
                    message.interlayerThickness = Number(object.interlayerThickness);
                switch (object.texture) {
                case "Default":
                case 0:
                    message.texture = 0;
                    break;
                case "Horizontal":
                case 1:
                    message.texture = 1;
                    break;
                case "Vertical":
                case 2:
                    message.texture = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a Panel message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Builder.Panel
             * @static
             * @param {pb.Builder.Panel} message Panel
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Panel.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.edge = [];
                    object.plastic = [];
                }
                if (options.defaults) {
                    object.contour = null;
                    object.bentPath = null;
                    object.bentDirection = false;
                    object.interlayerThickness = 0;
                    object.texture = options.enums === String ? "Default" : 0;
                }
                if (message.contour != null && message.hasOwnProperty("contour"))
                    object.contour = $root.pb.Element2D.toObject(message.contour, options);
                if (message.edge && message.edge.length) {
                    object.edge = [];
                    for (var j = 0; j < message.edge.length; ++j)
                        object.edge[j] = $root.pb.Builder.Panel.Edge.toObject(message.edge[j], options);
                }
                if (message.plastic && message.plastic.length) {
                    object.plastic = [];
                    for (var j = 0; j < message.plastic.length; ++j)
                        object.plastic[j] = $root.pb.Builder.Panel.Plastic.toObject(message.plastic[j], options);
                }
                if (message.bentPath != null && message.hasOwnProperty("bentPath"))
                    object.bentPath = $root.pb.Element2D.toObject(message.bentPath, options);
                if (message.bentDirection != null && message.hasOwnProperty("bentDirection"))
                    object.bentDirection = message.bentDirection;
                if (message.interlayerThickness != null && message.hasOwnProperty("interlayerThickness"))
                    object.interlayerThickness = options.json && !isFinite(message.interlayerThickness) ? String(message.interlayerThickness) : message.interlayerThickness;
                if (message.texture != null && message.hasOwnProperty("texture"))
                    object.texture = options.enums === String ? $root.pb.Builder.Panel.Texture[message.texture] : message.texture;
                return object;
            };

            /**
             * Converts this Panel to JSON.
             * @function toJSON
             * @memberof pb.Builder.Panel
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Panel.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Side enum.
             * @name pb.Builder.Panel.Side
             * @enum {string}
             * @property {number} None=0 None value
             * @property {number} Front=1 Front value
             * @property {number} Back=2 Back value
             */
            Panel.Side = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "None"] = 0;
                values[valuesById[1] = "Front"] = 1;
                values[valuesById[2] = "Back"] = 2;
                return values;
            })();

            /**
             * Texture enum.
             * @name pb.Builder.Panel.Texture
             * @enum {string}
             * @property {number} Default=0 Default value
             * @property {number} Horizontal=1 Horizontal value
             * @property {number} Vertical=2 Vertical value
             */
            Panel.Texture = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "Default"] = 0;
                values[valuesById[1] = "Horizontal"] = 1;
                values[valuesById[2] = "Vertical"] = 2;
                return values;
            })();

            Panel.Edge = (function() {

                /**
                 * Properties of an Edge.
                 * @memberof pb.Builder.Panel
                 * @interface IEdge
                 * @property {pb.IMaterial|null} [material] Edge material
                 * @property {boolean|null} [crop] Edge crop
                 * @property {number|null} [elemId] Edge elemId
                 * @property {number|null} [cutIndex] Edge cutIndex
                 * @property {number|null} [allowance] Edge allowance
                 */

                /**
                 * Constructs a new Edge.
                 * @memberof pb.Builder.Panel
                 * @classdesc Represents an Edge.
                 * @implements IEdge
                 * @constructor
                 * @param {pb.Builder.Panel.IEdge=} [properties] Properties to set
                 */
                function Edge(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Edge material.
                 * @member {pb.IMaterial|null|undefined} material
                 * @memberof pb.Builder.Panel.Edge
                 * @instance
                 */
                Edge.prototype.material = null;

                /**
                 * Edge crop.
                 * @member {boolean} crop
                 * @memberof pb.Builder.Panel.Edge
                 * @instance
                 */
                Edge.prototype.crop = false;

                /**
                 * Edge elemId.
                 * @member {number} elemId
                 * @memberof pb.Builder.Panel.Edge
                 * @instance
                 */
                Edge.prototype.elemId = 0;

                /**
                 * Edge cutIndex.
                 * @member {number} cutIndex
                 * @memberof pb.Builder.Panel.Edge
                 * @instance
                 */
                Edge.prototype.cutIndex = 0;

                /**
                 * Edge allowance.
                 * @member {number} allowance
                 * @memberof pb.Builder.Panel.Edge
                 * @instance
                 */
                Edge.prototype.allowance = 0;

                /**
                 * Creates a new Edge instance using the specified properties.
                 * @function create
                 * @memberof pb.Builder.Panel.Edge
                 * @static
                 * @param {pb.Builder.Panel.IEdge=} [properties] Properties to set
                 * @returns {pb.Builder.Panel.Edge} Edge instance
                 */
                Edge.create = function create(properties) {
                    return new Edge(properties);
                };

                /**
                 * Encodes the specified Edge message. Does not implicitly {@link pb.Builder.Panel.Edge.verify|verify} messages.
                 * @function encode
                 * @memberof pb.Builder.Panel.Edge
                 * @static
                 * @param {pb.Builder.Panel.IEdge} message Edge message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Edge.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.material != null && message.hasOwnProperty("material"))
                        $root.pb.Material.encode(message.material, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.crop != null && message.hasOwnProperty("crop"))
                        writer.uint32(/* id 2, wireType 0 =*/16).bool(message.crop);
                    if (message.elemId != null && message.hasOwnProperty("elemId"))
                        writer.uint32(/* id 3, wireType 0 =*/24).int32(message.elemId);
                    if (message.cutIndex != null && message.hasOwnProperty("cutIndex"))
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.cutIndex);
                    if (message.allowance != null && message.hasOwnProperty("allowance"))
                        writer.uint32(/* id 5, wireType 1 =*/41).double(message.allowance);
                    return writer;
                };

                /**
                 * Encodes the specified Edge message, length delimited. Does not implicitly {@link pb.Builder.Panel.Edge.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof pb.Builder.Panel.Edge
                 * @static
                 * @param {pb.Builder.Panel.IEdge} message Edge message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Edge.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an Edge message from the specified reader or buffer.
                 * @function decode
                 * @memberof pb.Builder.Panel.Edge
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {pb.Builder.Panel.Edge} Edge
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Edge.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Builder.Panel.Edge();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.material = $root.pb.Material.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.crop = reader.bool();
                            break;
                        case 3:
                            message.elemId = reader.int32();
                            break;
                        case 4:
                            message.cutIndex = reader.int32();
                            break;
                        case 5:
                            message.allowance = reader.double();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an Edge message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof pb.Builder.Panel.Edge
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {pb.Builder.Panel.Edge} Edge
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Edge.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an Edge message.
                 * @function verify
                 * @memberof pb.Builder.Panel.Edge
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Edge.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.material != null && message.hasOwnProperty("material")) {
                        var error = $root.pb.Material.verify(message.material);
                        if (error)
                            return "material." + error;
                    }
                    if (message.crop != null && message.hasOwnProperty("crop"))
                        if (typeof message.crop !== "boolean")
                            return "crop: boolean expected";
                    if (message.elemId != null && message.hasOwnProperty("elemId"))
                        if (!$util.isInteger(message.elemId))
                            return "elemId: integer expected";
                    if (message.cutIndex != null && message.hasOwnProperty("cutIndex"))
                        if (!$util.isInteger(message.cutIndex))
                            return "cutIndex: integer expected";
                    if (message.allowance != null && message.hasOwnProperty("allowance"))
                        if (typeof message.allowance !== "number")
                            return "allowance: number expected";
                    return null;
                };

                /**
                 * Creates an Edge message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof pb.Builder.Panel.Edge
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {pb.Builder.Panel.Edge} Edge
                 */
                Edge.fromObject = function fromObject(object) {
                    if (object instanceof $root.pb.Builder.Panel.Edge)
                        return object;
                    var message = new $root.pb.Builder.Panel.Edge();
                    if (object.material != null) {
                        if (typeof object.material !== "object")
                            throw TypeError(".pb.Builder.Panel.Edge.material: object expected");
                        message.material = $root.pb.Material.fromObject(object.material);
                    }
                    if (object.crop != null)
                        message.crop = Boolean(object.crop);
                    if (object.elemId != null)
                        message.elemId = object.elemId | 0;
                    if (object.cutIndex != null)
                        message.cutIndex = object.cutIndex | 0;
                    if (object.allowance != null)
                        message.allowance = Number(object.allowance);
                    return message;
                };

                /**
                 * Creates a plain object from an Edge message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof pb.Builder.Panel.Edge
                 * @static
                 * @param {pb.Builder.Panel.Edge} message Edge
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Edge.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.material = null;
                        object.crop = false;
                        object.elemId = 0;
                        object.cutIndex = 0;
                        object.allowance = 0;
                    }
                    if (message.material != null && message.hasOwnProperty("material"))
                        object.material = $root.pb.Material.toObject(message.material, options);
                    if (message.crop != null && message.hasOwnProperty("crop"))
                        object.crop = message.crop;
                    if (message.elemId != null && message.hasOwnProperty("elemId"))
                        object.elemId = message.elemId;
                    if (message.cutIndex != null && message.hasOwnProperty("cutIndex"))
                        object.cutIndex = message.cutIndex;
                    if (message.allowance != null && message.hasOwnProperty("allowance"))
                        object.allowance = options.json && !isFinite(message.allowance) ? String(message.allowance) : message.allowance;
                    return object;
                };

                /**
                 * Converts this Edge to JSON.
                 * @function toJSON
                 * @memberof pb.Builder.Panel.Edge
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Edge.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Edge;
            })();

            Panel.Plastic = (function() {

                /**
                 * Properties of a Plastic.
                 * @memberof pb.Builder.Panel
                 * @interface IPlastic
                 * @property {pb.IMaterial|null} [material] Plastic material
                 * @property {pb.Builder.Panel.Side|null} [side] Plastic side
                 * @property {pb.IElement2D|null} [contour] Plastic contour
                 * @property {pb.Builder.Panel.Texture|null} [texture] Plastic texture
                 */

                /**
                 * Constructs a new Plastic.
                 * @memberof pb.Builder.Panel
                 * @classdesc Represents a Plastic.
                 * @implements IPlastic
                 * @constructor
                 * @param {pb.Builder.Panel.IPlastic=} [properties] Properties to set
                 */
                function Plastic(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Plastic material.
                 * @member {pb.IMaterial|null|undefined} material
                 * @memberof pb.Builder.Panel.Plastic
                 * @instance
                 */
                Plastic.prototype.material = null;

                /**
                 * Plastic side.
                 * @member {pb.Builder.Panel.Side} side
                 * @memberof pb.Builder.Panel.Plastic
                 * @instance
                 */
                Plastic.prototype.side = 0;

                /**
                 * Plastic contour.
                 * @member {pb.IElement2D|null|undefined} contour
                 * @memberof pb.Builder.Panel.Plastic
                 * @instance
                 */
                Plastic.prototype.contour = null;

                /**
                 * Plastic texture.
                 * @member {pb.Builder.Panel.Texture} texture
                 * @memberof pb.Builder.Panel.Plastic
                 * @instance
                 */
                Plastic.prototype.texture = 0;

                /**
                 * Creates a new Plastic instance using the specified properties.
                 * @function create
                 * @memberof pb.Builder.Panel.Plastic
                 * @static
                 * @param {pb.Builder.Panel.IPlastic=} [properties] Properties to set
                 * @returns {pb.Builder.Panel.Plastic} Plastic instance
                 */
                Plastic.create = function create(properties) {
                    return new Plastic(properties);
                };

                /**
                 * Encodes the specified Plastic message. Does not implicitly {@link pb.Builder.Panel.Plastic.verify|verify} messages.
                 * @function encode
                 * @memberof pb.Builder.Panel.Plastic
                 * @static
                 * @param {pb.Builder.Panel.IPlastic} message Plastic message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Plastic.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.material != null && message.hasOwnProperty("material"))
                        $root.pb.Material.encode(message.material, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                    if (message.side != null && message.hasOwnProperty("side"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.side);
                    if (message.contour != null && message.hasOwnProperty("contour"))
                        $root.pb.Element2D.encode(message.contour, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                    if (message.texture != null && message.hasOwnProperty("texture"))
                        writer.uint32(/* id 4, wireType 0 =*/32).int32(message.texture);
                    return writer;
                };

                /**
                 * Encodes the specified Plastic message, length delimited. Does not implicitly {@link pb.Builder.Panel.Plastic.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof pb.Builder.Panel.Plastic
                 * @static
                 * @param {pb.Builder.Panel.IPlastic} message Plastic message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Plastic.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Plastic message from the specified reader or buffer.
                 * @function decode
                 * @memberof pb.Builder.Panel.Plastic
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {pb.Builder.Panel.Plastic} Plastic
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Plastic.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Builder.Panel.Plastic();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.material = $root.pb.Material.decode(reader, reader.uint32());
                            break;
                        case 2:
                            message.side = reader.int32();
                            break;
                        case 3:
                            message.contour = $root.pb.Element2D.decode(reader, reader.uint32());
                            break;
                        case 4:
                            message.texture = reader.int32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Plastic message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof pb.Builder.Panel.Plastic
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {pb.Builder.Panel.Plastic} Plastic
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Plastic.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Plastic message.
                 * @function verify
                 * @memberof pb.Builder.Panel.Plastic
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Plastic.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.material != null && message.hasOwnProperty("material")) {
                        var error = $root.pb.Material.verify(message.material);
                        if (error)
                            return "material." + error;
                    }
                    if (message.side != null && message.hasOwnProperty("side"))
                        switch (message.side) {
                        default:
                            return "side: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                            break;
                        }
                    if (message.contour != null && message.hasOwnProperty("contour")) {
                        var error = $root.pb.Element2D.verify(message.contour);
                        if (error)
                            return "contour." + error;
                    }
                    if (message.texture != null && message.hasOwnProperty("texture"))
                        switch (message.texture) {
                        default:
                            return "texture: enum value expected";
                        case 0:
                        case 1:
                        case 2:
                            break;
                        }
                    return null;
                };

                /**
                 * Creates a Plastic message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof pb.Builder.Panel.Plastic
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {pb.Builder.Panel.Plastic} Plastic
                 */
                Plastic.fromObject = function fromObject(object) {
                    if (object instanceof $root.pb.Builder.Panel.Plastic)
                        return object;
                    var message = new $root.pb.Builder.Panel.Plastic();
                    if (object.material != null) {
                        if (typeof object.material !== "object")
                            throw TypeError(".pb.Builder.Panel.Plastic.material: object expected");
                        message.material = $root.pb.Material.fromObject(object.material);
                    }
                    switch (object.side) {
                    case "None":
                    case 0:
                        message.side = 0;
                        break;
                    case "Front":
                    case 1:
                        message.side = 1;
                        break;
                    case "Back":
                    case 2:
                        message.side = 2;
                        break;
                    }
                    if (object.contour != null) {
                        if (typeof object.contour !== "object")
                            throw TypeError(".pb.Builder.Panel.Plastic.contour: object expected");
                        message.contour = $root.pb.Element2D.fromObject(object.contour);
                    }
                    switch (object.texture) {
                    case "Default":
                    case 0:
                        message.texture = 0;
                        break;
                    case "Horizontal":
                    case 1:
                        message.texture = 1;
                        break;
                    case "Vertical":
                    case 2:
                        message.texture = 2;
                        break;
                    }
                    return message;
                };

                /**
                 * Creates a plain object from a Plastic message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof pb.Builder.Panel.Plastic
                 * @static
                 * @param {pb.Builder.Panel.Plastic} message Plastic
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Plastic.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.material = null;
                        object.side = options.enums === String ? "None" : 0;
                        object.contour = null;
                        object.texture = options.enums === String ? "Default" : 0;
                    }
                    if (message.material != null && message.hasOwnProperty("material"))
                        object.material = $root.pb.Material.toObject(message.material, options);
                    if (message.side != null && message.hasOwnProperty("side"))
                        object.side = options.enums === String ? $root.pb.Builder.Panel.Side[message.side] : message.side;
                    if (message.contour != null && message.hasOwnProperty("contour"))
                        object.contour = $root.pb.Element2D.toObject(message.contour, options);
                    if (message.texture != null && message.hasOwnProperty("texture"))
                        object.texture = options.enums === String ? $root.pb.Builder.Panel.Texture[message.texture] : message.texture;
                    return object;
                };

                /**
                 * Converts this Plastic to JSON.
                 * @function toJSON
                 * @memberof pb.Builder.Panel.Plastic
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Plastic.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Plastic;
            })();

            return Panel;
        })();

        Builder.Profile = (function() {

            /**
             * Properties of a Profile.
             * @memberof pb.Builder
             * @interface IProfile
             * @property {pb.IElement2D|null} [path] Profile path
             * @property {pb.IElement2D|null} [profile] Profile profile
             */

            /**
             * Constructs a new Profile.
             * @memberof pb.Builder
             * @classdesc Represents a Profile.
             * @implements IProfile
             * @constructor
             * @param {pb.Builder.IProfile=} [properties] Properties to set
             */
            function Profile(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Profile path.
             * @member {pb.IElement2D|null|undefined} path
             * @memberof pb.Builder.Profile
             * @instance
             */
            Profile.prototype.path = null;

            /**
             * Profile profile.
             * @member {pb.IElement2D|null|undefined} profile
             * @memberof pb.Builder.Profile
             * @instance
             */
            Profile.prototype.profile = null;

            /**
             * Creates a new Profile instance using the specified properties.
             * @function create
             * @memberof pb.Builder.Profile
             * @static
             * @param {pb.Builder.IProfile=} [properties] Properties to set
             * @returns {pb.Builder.Profile} Profile instance
             */
            Profile.create = function create(properties) {
                return new Profile(properties);
            };

            /**
             * Encodes the specified Profile message. Does not implicitly {@link pb.Builder.Profile.verify|verify} messages.
             * @function encode
             * @memberof pb.Builder.Profile
             * @static
             * @param {pb.Builder.IProfile} message Profile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Profile.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.path != null && message.hasOwnProperty("path"))
                    $root.pb.Element2D.encode(message.path, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.profile != null && message.hasOwnProperty("profile"))
                    $root.pb.Element2D.encode(message.profile, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Profile message, length delimited. Does not implicitly {@link pb.Builder.Profile.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Builder.Profile
             * @static
             * @param {pb.Builder.IProfile} message Profile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Profile.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Profile message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Builder.Profile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Builder.Profile} Profile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Profile.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Builder.Profile();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.path = $root.pb.Element2D.decode(reader, reader.uint32());
                        break;
                    case 2:
                        message.profile = $root.pb.Element2D.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Profile message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Builder.Profile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Builder.Profile} Profile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Profile.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Profile message.
             * @function verify
             * @memberof pb.Builder.Profile
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Profile.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.path != null && message.hasOwnProperty("path")) {
                    var error = $root.pb.Element2D.verify(message.path);
                    if (error)
                        return "path." + error;
                }
                if (message.profile != null && message.hasOwnProperty("profile")) {
                    var error = $root.pb.Element2D.verify(message.profile);
                    if (error)
                        return "profile." + error;
                }
                return null;
            };

            /**
             * Creates a Profile message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Builder.Profile
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Builder.Profile} Profile
             */
            Profile.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Builder.Profile)
                    return object;
                var message = new $root.pb.Builder.Profile();
                if (object.path != null) {
                    if (typeof object.path !== "object")
                        throw TypeError(".pb.Builder.Profile.path: object expected");
                    message.path = $root.pb.Element2D.fromObject(object.path);
                }
                if (object.profile != null) {
                    if (typeof object.profile !== "object")
                        throw TypeError(".pb.Builder.Profile.profile: object expected");
                    message.profile = $root.pb.Element2D.fromObject(object.profile);
                }
                return message;
            };

            /**
             * Creates a plain object from a Profile message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Builder.Profile
             * @static
             * @param {pb.Builder.Profile} message Profile
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Profile.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.path = null;
                    object.profile = null;
                }
                if (message.path != null && message.hasOwnProperty("path"))
                    object.path = $root.pb.Element2D.toObject(message.path, options);
                if (message.profile != null && message.hasOwnProperty("profile"))
                    object.profile = $root.pb.Element2D.toObject(message.profile, options);
                return object;
            };

            /**
             * Converts this Profile to JSON.
             * @function toJSON
             * @memberof pb.Builder.Profile
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Profile.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Profile;
        })();

        Builder.Rotation = (function() {

            /**
             * Properties of a Rotation.
             * @memberof pb.Builder
             * @interface IRotation
             * @property {pb.IElement2D|null} [profile] Rotation profile
             */

            /**
             * Constructs a new Rotation.
             * @memberof pb.Builder
             * @classdesc Represents a Rotation.
             * @implements IRotation
             * @constructor
             * @param {pb.Builder.IRotation=} [properties] Properties to set
             */
            function Rotation(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Rotation profile.
             * @member {pb.IElement2D|null|undefined} profile
             * @memberof pb.Builder.Rotation
             * @instance
             */
            Rotation.prototype.profile = null;

            /**
             * Creates a new Rotation instance using the specified properties.
             * @function create
             * @memberof pb.Builder.Rotation
             * @static
             * @param {pb.Builder.IRotation=} [properties] Properties to set
             * @returns {pb.Builder.Rotation} Rotation instance
             */
            Rotation.create = function create(properties) {
                return new Rotation(properties);
            };

            /**
             * Encodes the specified Rotation message. Does not implicitly {@link pb.Builder.Rotation.verify|verify} messages.
             * @function encode
             * @memberof pb.Builder.Rotation
             * @static
             * @param {pb.Builder.IRotation} message Rotation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Rotation.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.profile != null && message.hasOwnProperty("profile"))
                    $root.pb.Element2D.encode(message.profile, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Rotation message, length delimited. Does not implicitly {@link pb.Builder.Rotation.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Builder.Rotation
             * @static
             * @param {pb.Builder.IRotation} message Rotation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Rotation.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Rotation message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Builder.Rotation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Builder.Rotation} Rotation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Rotation.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Builder.Rotation();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.profile = $root.pb.Element2D.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Rotation message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Builder.Rotation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Builder.Rotation} Rotation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Rotation.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Rotation message.
             * @function verify
             * @memberof pb.Builder.Rotation
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Rotation.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.profile != null && message.hasOwnProperty("profile")) {
                    var error = $root.pb.Element2D.verify(message.profile);
                    if (error)
                        return "profile." + error;
                }
                return null;
            };

            /**
             * Creates a Rotation message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Builder.Rotation
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Builder.Rotation} Rotation
             */
            Rotation.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Builder.Rotation)
                    return object;
                var message = new $root.pb.Builder.Rotation();
                if (object.profile != null) {
                    if (typeof object.profile !== "object")
                        throw TypeError(".pb.Builder.Rotation.profile: object expected");
                    message.profile = $root.pb.Element2D.fromObject(object.profile);
                }
                return message;
            };

            /**
             * Creates a plain object from a Rotation message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Builder.Rotation
             * @static
             * @param {pb.Builder.Rotation} message Rotation
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Rotation.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.profile = null;
                if (message.profile != null && message.hasOwnProperty("profile"))
                    object.profile = $root.pb.Element2D.toObject(message.profile, options);
                return object;
            };

            /**
             * Converts this Rotation to JSON.
             * @function toJSON
             * @memberof pb.Builder.Rotation
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Rotation.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Rotation;
        })();

        Builder.Solid = (function() {

            /**
             * Properties of a Solid.
             * @memberof pb.Builder
             * @interface ISolid
             * @property {Uint8Array|null} [mbSolid] Solid mbSolid
             */

            /**
             * Constructs a new Solid.
             * @memberof pb.Builder
             * @classdesc Represents a Solid.
             * @implements ISolid
             * @constructor
             * @param {pb.Builder.ISolid=} [properties] Properties to set
             */
            function Solid(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Solid mbSolid.
             * @member {Uint8Array} mbSolid
             * @memberof pb.Builder.Solid
             * @instance
             */
            Solid.prototype.mbSolid = $util.newBuffer([]);

            /**
             * Creates a new Solid instance using the specified properties.
             * @function create
             * @memberof pb.Builder.Solid
             * @static
             * @param {pb.Builder.ISolid=} [properties] Properties to set
             * @returns {pb.Builder.Solid} Solid instance
             */
            Solid.create = function create(properties) {
                return new Solid(properties);
            };

            /**
             * Encodes the specified Solid message. Does not implicitly {@link pb.Builder.Solid.verify|verify} messages.
             * @function encode
             * @memberof pb.Builder.Solid
             * @static
             * @param {pb.Builder.ISolid} message Solid message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Solid.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.mbSolid != null && message.hasOwnProperty("mbSolid"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.mbSolid);
                return writer;
            };

            /**
             * Encodes the specified Solid message, length delimited. Does not implicitly {@link pb.Builder.Solid.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Builder.Solid
             * @static
             * @param {pb.Builder.ISolid} message Solid message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Solid.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Solid message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Builder.Solid
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Builder.Solid} Solid
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Solid.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Builder.Solid();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.mbSolid = reader.bytes();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Solid message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Builder.Solid
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Builder.Solid} Solid
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Solid.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Solid message.
             * @function verify
             * @memberof pb.Builder.Solid
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Solid.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.mbSolid != null && message.hasOwnProperty("mbSolid"))
                    if (!(message.mbSolid && typeof message.mbSolid.length === "number" || $util.isString(message.mbSolid)))
                        return "mbSolid: buffer expected";
                return null;
            };

            /**
             * Creates a Solid message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Builder.Solid
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Builder.Solid} Solid
             */
            Solid.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Builder.Solid)
                    return object;
                var message = new $root.pb.Builder.Solid();
                if (object.mbSolid != null)
                    if (typeof object.mbSolid === "string")
                        $util.base64.decode(object.mbSolid, message.mbSolid = $util.newBuffer($util.base64.length(object.mbSolid)), 0);
                    else if (object.mbSolid.length)
                        message.mbSolid = object.mbSolid;
                return message;
            };

            /**
             * Creates a plain object from a Solid message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Builder.Solid
             * @static
             * @param {pb.Builder.Solid} message Solid
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Solid.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.mbSolid = "";
                    else {
                        object.mbSolid = [];
                        if (options.bytes !== Array)
                            object.mbSolid = $util.newBuffer(object.mbSolid);
                    }
                if (message.mbSolid != null && message.hasOwnProperty("mbSolid"))
                    object.mbSolid = options.bytes === String ? $util.base64.encode(message.mbSolid, 0, message.mbSolid.length) : options.bytes === Array ? Array.prototype.slice.call(message.mbSolid) : message.mbSolid;
                return object;
            };

            /**
             * Converts this Solid to JSON.
             * @function toJSON
             * @memberof pb.Builder.Solid
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Solid.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Solid;
        })();

        return Builder;
    })();

    pb.Operation = (function() {

        /**
         * Properties of an Operation.
         * @memberof pb
         * @interface IOperation
         * @property {number|Long|null} [link] Operation link
         * @property {number|Long|null} [linkRevision] Operation linkRevision
         * @property {string|null} [name] Operation name
         * @property {pb.Operation.ICut|null} [cut] Operation cut
         * @property {pb.Operation.IExternalCut|null} [externalCut] Operation externalCut
         * @property {pb.Operation.IClip|null} [clip] Operation clip
         * @property {pb.Operation.IPainting|null} [painting] Operation painting
         * @property {pb.Operation.IHole|null} [hole] Operation hole
         */

        /**
         * Constructs a new Operation.
         * @memberof pb
         * @classdesc Represents an Operation.
         * @implements IOperation
         * @constructor
         * @param {pb.IOperation=} [properties] Properties to set
         */
        function Operation(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Operation link.
         * @member {number|Long} link
         * @memberof pb.Operation
         * @instance
         */
        Operation.prototype.link = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Operation linkRevision.
         * @member {number|Long} linkRevision
         * @memberof pb.Operation
         * @instance
         */
        Operation.prototype.linkRevision = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Operation name.
         * @member {string} name
         * @memberof pb.Operation
         * @instance
         */
        Operation.prototype.name = "";

        /**
         * Operation cut.
         * @member {pb.Operation.ICut|null|undefined} cut
         * @memberof pb.Operation
         * @instance
         */
        Operation.prototype.cut = null;

        /**
         * Operation externalCut.
         * @member {pb.Operation.IExternalCut|null|undefined} externalCut
         * @memberof pb.Operation
         * @instance
         */
        Operation.prototype.externalCut = null;

        /**
         * Operation clip.
         * @member {pb.Operation.IClip|null|undefined} clip
         * @memberof pb.Operation
         * @instance
         */
        Operation.prototype.clip = null;

        /**
         * Operation painting.
         * @member {pb.Operation.IPainting|null|undefined} painting
         * @memberof pb.Operation
         * @instance
         */
        Operation.prototype.painting = null;

        /**
         * Operation hole.
         * @member {pb.Operation.IHole|null|undefined} hole
         * @memberof pb.Operation
         * @instance
         */
        Operation.prototype.hole = null;

        /**
         * Creates a new Operation instance using the specified properties.
         * @function create
         * @memberof pb.Operation
         * @static
         * @param {pb.IOperation=} [properties] Properties to set
         * @returns {pb.Operation} Operation instance
         */
        Operation.create = function create(properties) {
            return new Operation(properties);
        };

        /**
         * Encodes the specified Operation message. Does not implicitly {@link pb.Operation.verify|verify} messages.
         * @function encode
         * @memberof pb.Operation
         * @static
         * @param {pb.IOperation} message Operation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Operation.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.link != null && message.hasOwnProperty("link"))
                writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.link);
            if (message.linkRevision != null && message.hasOwnProperty("linkRevision"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.linkRevision);
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.name);
            if (message.cut != null && message.hasOwnProperty("cut"))
                $root.pb.Operation.Cut.encode(message.cut, writer.uint32(/* id 100, wireType 2 =*/802).fork()).ldelim();
            if (message.externalCut != null && message.hasOwnProperty("externalCut"))
                $root.pb.Operation.ExternalCut.encode(message.externalCut, writer.uint32(/* id 101, wireType 2 =*/810).fork()).ldelim();
            if (message.clip != null && message.hasOwnProperty("clip"))
                $root.pb.Operation.Clip.encode(message.clip, writer.uint32(/* id 103, wireType 2 =*/826).fork()).ldelim();
            if (message.painting != null && message.hasOwnProperty("painting"))
                $root.pb.Operation.Painting.encode(message.painting, writer.uint32(/* id 104, wireType 2 =*/834).fork()).ldelim();
            if (message.hole != null && message.hasOwnProperty("hole"))
                $root.pb.Operation.Hole.encode(message.hole, writer.uint32(/* id 105, wireType 2 =*/842).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Operation message, length delimited. Does not implicitly {@link pb.Operation.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.Operation
         * @static
         * @param {pb.IOperation} message Operation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Operation.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Operation message from the specified reader or buffer.
         * @function decode
         * @memberof pb.Operation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.Operation} Operation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Operation.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Operation();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.link = reader.fixed64();
                    break;
                case 2:
                    message.linkRevision = reader.int64();
                    break;
                case 3:
                    message.name = reader.string();
                    break;
                case 100:
                    message.cut = $root.pb.Operation.Cut.decode(reader, reader.uint32());
                    break;
                case 101:
                    message.externalCut = $root.pb.Operation.ExternalCut.decode(reader, reader.uint32());
                    break;
                case 103:
                    message.clip = $root.pb.Operation.Clip.decode(reader, reader.uint32());
                    break;
                case 104:
                    message.painting = $root.pb.Operation.Painting.decode(reader, reader.uint32());
                    break;
                case 105:
                    message.hole = $root.pb.Operation.Hole.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Operation message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.Operation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.Operation} Operation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Operation.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Operation message.
         * @function verify
         * @memberof pb.Operation
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Operation.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.link != null && message.hasOwnProperty("link"))
                if (!$util.isInteger(message.link) && !(message.link && $util.isInteger(message.link.low) && $util.isInteger(message.link.high)))
                    return "link: integer|Long expected";
            if (message.linkRevision != null && message.hasOwnProperty("linkRevision"))
                if (!$util.isInteger(message.linkRevision) && !(message.linkRevision && $util.isInteger(message.linkRevision.low) && $util.isInteger(message.linkRevision.high)))
                    return "linkRevision: integer|Long expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.cut != null && message.hasOwnProperty("cut")) {
                var error = $root.pb.Operation.Cut.verify(message.cut);
                if (error)
                    return "cut." + error;
            }
            if (message.externalCut != null && message.hasOwnProperty("externalCut")) {
                var error = $root.pb.Operation.ExternalCut.verify(message.externalCut);
                if (error)
                    return "externalCut." + error;
            }
            if (message.clip != null && message.hasOwnProperty("clip")) {
                var error = $root.pb.Operation.Clip.verify(message.clip);
                if (error)
                    return "clip." + error;
            }
            if (message.painting != null && message.hasOwnProperty("painting")) {
                var error = $root.pb.Operation.Painting.verify(message.painting);
                if (error)
                    return "painting." + error;
            }
            if (message.hole != null && message.hasOwnProperty("hole")) {
                var error = $root.pb.Operation.Hole.verify(message.hole);
                if (error)
                    return "hole." + error;
            }
            return null;
        };

        /**
         * Creates an Operation message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.Operation
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.Operation} Operation
         */
        Operation.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.Operation)
                return object;
            var message = new $root.pb.Operation();
            if (object.link != null)
                if ($util.Long)
                    (message.link = $util.Long.fromValue(object.link)).unsigned = false;
                else if (typeof object.link === "string")
                    message.link = parseInt(object.link, 10);
                else if (typeof object.link === "number")
                    message.link = object.link;
                else if (typeof object.link === "object")
                    message.link = new $util.LongBits(object.link.low >>> 0, object.link.high >>> 0).toNumber();
            if (object.linkRevision != null)
                if ($util.Long)
                    (message.linkRevision = $util.Long.fromValue(object.linkRevision)).unsigned = false;
                else if (typeof object.linkRevision === "string")
                    message.linkRevision = parseInt(object.linkRevision, 10);
                else if (typeof object.linkRevision === "number")
                    message.linkRevision = object.linkRevision;
                else if (typeof object.linkRevision === "object")
                    message.linkRevision = new $util.LongBits(object.linkRevision.low >>> 0, object.linkRevision.high >>> 0).toNumber();
            if (object.name != null)
                message.name = String(object.name);
            if (object.cut != null) {
                if (typeof object.cut !== "object")
                    throw TypeError(".pb.Operation.cut: object expected");
                message.cut = $root.pb.Operation.Cut.fromObject(object.cut);
            }
            if (object.externalCut != null) {
                if (typeof object.externalCut !== "object")
                    throw TypeError(".pb.Operation.externalCut: object expected");
                message.externalCut = $root.pb.Operation.ExternalCut.fromObject(object.externalCut);
            }
            if (object.clip != null) {
                if (typeof object.clip !== "object")
                    throw TypeError(".pb.Operation.clip: object expected");
                message.clip = $root.pb.Operation.Clip.fromObject(object.clip);
            }
            if (object.painting != null) {
                if (typeof object.painting !== "object")
                    throw TypeError(".pb.Operation.painting: object expected");
                message.painting = $root.pb.Operation.Painting.fromObject(object.painting);
            }
            if (object.hole != null) {
                if (typeof object.hole !== "object")
                    throw TypeError(".pb.Operation.hole: object expected");
                message.hole = $root.pb.Operation.Hole.fromObject(object.hole);
            }
            return message;
        };

        /**
         * Creates a plain object from an Operation message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.Operation
         * @static
         * @param {pb.Operation} message Operation
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Operation.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.link = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.link = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.linkRevision = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.linkRevision = options.longs === String ? "0" : 0;
                object.name = "";
                object.cut = null;
                object.externalCut = null;
                object.clip = null;
                object.painting = null;
                object.hole = null;
            }
            if (message.link != null && message.hasOwnProperty("link"))
                if (typeof message.link === "number")
                    object.link = options.longs === String ? String(message.link) : message.link;
                else
                    object.link = options.longs === String ? $util.Long.prototype.toString.call(message.link) : options.longs === Number ? new $util.LongBits(message.link.low >>> 0, message.link.high >>> 0).toNumber() : message.link;
            if (message.linkRevision != null && message.hasOwnProperty("linkRevision"))
                if (typeof message.linkRevision === "number")
                    object.linkRevision = options.longs === String ? String(message.linkRevision) : message.linkRevision;
                else
                    object.linkRevision = options.longs === String ? $util.Long.prototype.toString.call(message.linkRevision) : options.longs === Number ? new $util.LongBits(message.linkRevision.low >>> 0, message.linkRevision.high >>> 0).toNumber() : message.linkRevision;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.cut != null && message.hasOwnProperty("cut"))
                object.cut = $root.pb.Operation.Cut.toObject(message.cut, options);
            if (message.externalCut != null && message.hasOwnProperty("externalCut"))
                object.externalCut = $root.pb.Operation.ExternalCut.toObject(message.externalCut, options);
            if (message.clip != null && message.hasOwnProperty("clip"))
                object.clip = $root.pb.Operation.Clip.toObject(message.clip, options);
            if (message.painting != null && message.hasOwnProperty("painting"))
                object.painting = $root.pb.Operation.Painting.toObject(message.painting, options);
            if (message.hole != null && message.hasOwnProperty("hole"))
                object.hole = $root.pb.Operation.Hole.toObject(message.hole, options);
            return object;
        };

        /**
         * Converts this Operation to JSON.
         * @function toJSON
         * @memberof pb.Operation
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Operation.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Operation.Cut = (function() {

            /**
             * Properties of a Cut.
             * @memberof pb.Operation
             * @interface ICut
             * @property {pb.IBuilder|null} [body] Cut body
             * @property {Array.<number>|null} [matrix] Cut matrix
             * @property {boolean|null} [bent] Cut bent
             * @property {pb.Operation.Cut.Mode|null} [mode] Cut mode
             */

            /**
             * Constructs a new Cut.
             * @memberof pb.Operation
             * @classdesc Represents a Cut.
             * @implements ICut
             * @constructor
             * @param {pb.Operation.ICut=} [properties] Properties to set
             */
            function Cut(properties) {
                this.matrix = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Cut body.
             * @member {pb.IBuilder|null|undefined} body
             * @memberof pb.Operation.Cut
             * @instance
             */
            Cut.prototype.body = null;

            /**
             * Cut matrix.
             * @member {Array.<number>} matrix
             * @memberof pb.Operation.Cut
             * @instance
             */
            Cut.prototype.matrix = $util.emptyArray;

            /**
             * Cut bent.
             * @member {boolean} bent
             * @memberof pb.Operation.Cut
             * @instance
             */
            Cut.prototype.bent = false;

            /**
             * Cut mode.
             * @member {pb.Operation.Cut.Mode} mode
             * @memberof pb.Operation.Cut
             * @instance
             */
            Cut.prototype.mode = 0;

            /**
             * Creates a new Cut instance using the specified properties.
             * @function create
             * @memberof pb.Operation.Cut
             * @static
             * @param {pb.Operation.ICut=} [properties] Properties to set
             * @returns {pb.Operation.Cut} Cut instance
             */
            Cut.create = function create(properties) {
                return new Cut(properties);
            };

            /**
             * Encodes the specified Cut message. Does not implicitly {@link pb.Operation.Cut.verify|verify} messages.
             * @function encode
             * @memberof pb.Operation.Cut
             * @static
             * @param {pb.Operation.ICut} message Cut message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Cut.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.body != null && message.hasOwnProperty("body"))
                    $root.pb.Builder.encode(message.body, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.matrix != null && message.matrix.length) {
                    writer.uint32(/* id 2, wireType 2 =*/18).fork();
                    for (var i = 0; i < message.matrix.length; ++i)
                        writer.double(message.matrix[i]);
                    writer.ldelim();
                }
                if (message.bent != null && message.hasOwnProperty("bent"))
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.bent);
                if (message.mode != null && message.hasOwnProperty("mode"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.mode);
                return writer;
            };

            /**
             * Encodes the specified Cut message, length delimited. Does not implicitly {@link pb.Operation.Cut.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Operation.Cut
             * @static
             * @param {pb.Operation.ICut} message Cut message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Cut.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Cut message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Operation.Cut
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Operation.Cut} Cut
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Cut.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Operation.Cut();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.body = $root.pb.Builder.decode(reader, reader.uint32());
                        break;
                    case 2:
                        if (!(message.matrix && message.matrix.length))
                            message.matrix = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.matrix.push(reader.double());
                        } else
                            message.matrix.push(reader.double());
                        break;
                    case 3:
                        message.bent = reader.bool();
                        break;
                    case 4:
                        message.mode = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Cut message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Operation.Cut
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Operation.Cut} Cut
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Cut.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Cut message.
             * @function verify
             * @memberof pb.Operation.Cut
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Cut.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.body != null && message.hasOwnProperty("body")) {
                    var error = $root.pb.Builder.verify(message.body);
                    if (error)
                        return "body." + error;
                }
                if (message.matrix != null && message.hasOwnProperty("matrix")) {
                    if (!Array.isArray(message.matrix))
                        return "matrix: array expected";
                    for (var i = 0; i < message.matrix.length; ++i)
                        if (typeof message.matrix[i] !== "number")
                            return "matrix: number[] expected";
                }
                if (message.bent != null && message.hasOwnProperty("bent"))
                    if (typeof message.bent !== "boolean")
                        return "bent: boolean expected";
                if (message.mode != null && message.hasOwnProperty("mode"))
                    switch (message.mode) {
                    default:
                        return "mode: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                return null;
            };

            /**
             * Creates a Cut message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Operation.Cut
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Operation.Cut} Cut
             */
            Cut.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Operation.Cut)
                    return object;
                var message = new $root.pb.Operation.Cut();
                if (object.body != null) {
                    if (typeof object.body !== "object")
                        throw TypeError(".pb.Operation.Cut.body: object expected");
                    message.body = $root.pb.Builder.fromObject(object.body);
                }
                if (object.matrix) {
                    if (!Array.isArray(object.matrix))
                        throw TypeError(".pb.Operation.Cut.matrix: array expected");
                    message.matrix = [];
                    for (var i = 0; i < object.matrix.length; ++i)
                        message.matrix[i] = Number(object.matrix[i]);
                }
                if (object.bent != null)
                    message.bent = Boolean(object.bent);
                switch (object.mode) {
                case "Subtract":
                case 0:
                    message.mode = 0;
                    break;
                case "Add":
                case 1:
                    message.mode = 1;
                    break;
                case "Intersect":
                case 2:
                    message.mode = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a Cut message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Operation.Cut
             * @static
             * @param {pb.Operation.Cut} message Cut
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Cut.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.matrix = [];
                if (options.defaults) {
                    object.body = null;
                    object.bent = false;
                    object.mode = options.enums === String ? "Subtract" : 0;
                }
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = $root.pb.Builder.toObject(message.body, options);
                if (message.matrix && message.matrix.length) {
                    object.matrix = [];
                    for (var j = 0; j < message.matrix.length; ++j)
                        object.matrix[j] = options.json && !isFinite(message.matrix[j]) ? String(message.matrix[j]) : message.matrix[j];
                }
                if (message.bent != null && message.hasOwnProperty("bent"))
                    object.bent = message.bent;
                if (message.mode != null && message.hasOwnProperty("mode"))
                    object.mode = options.enums === String ? $root.pb.Operation.Cut.Mode[message.mode] : message.mode;
                return object;
            };

            /**
             * Converts this Cut to JSON.
             * @function toJSON
             * @memberof pb.Operation.Cut
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Cut.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Mode enum.
             * @name pb.Operation.Cut.Mode
             * @enum {string}
             * @property {number} Subtract=0 Subtract value
             * @property {number} Add=1 Add value
             * @property {number} Intersect=2 Intersect value
             */
            Cut.Mode = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "Subtract"] = 0;
                values[valuesById[1] = "Add"] = 1;
                values[valuesById[2] = "Intersect"] = 2;
                return values;
            })();

            return Cut;
        })();

        Operation.ExternalCut = (function() {

            /**
             * Properties of an ExternalCut.
             * @memberof pb.Operation
             * @interface IExternalCut
             * @property {boolean|null} [enabled] ExternalCut enabled
             */

            /**
             * Constructs a new ExternalCut.
             * @memberof pb.Operation
             * @classdesc Represents an ExternalCut.
             * @implements IExternalCut
             * @constructor
             * @param {pb.Operation.IExternalCut=} [properties] Properties to set
             */
            function ExternalCut(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ExternalCut enabled.
             * @member {boolean} enabled
             * @memberof pb.Operation.ExternalCut
             * @instance
             */
            ExternalCut.prototype.enabled = false;

            /**
             * Creates a new ExternalCut instance using the specified properties.
             * @function create
             * @memberof pb.Operation.ExternalCut
             * @static
             * @param {pb.Operation.IExternalCut=} [properties] Properties to set
             * @returns {pb.Operation.ExternalCut} ExternalCut instance
             */
            ExternalCut.create = function create(properties) {
                return new ExternalCut(properties);
            };

            /**
             * Encodes the specified ExternalCut message. Does not implicitly {@link pb.Operation.ExternalCut.verify|verify} messages.
             * @function encode
             * @memberof pb.Operation.ExternalCut
             * @static
             * @param {pb.Operation.IExternalCut} message ExternalCut message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExternalCut.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.enabled != null && message.hasOwnProperty("enabled"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.enabled);
                return writer;
            };

            /**
             * Encodes the specified ExternalCut message, length delimited. Does not implicitly {@link pb.Operation.ExternalCut.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Operation.ExternalCut
             * @static
             * @param {pb.Operation.IExternalCut} message ExternalCut message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExternalCut.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ExternalCut message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Operation.ExternalCut
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Operation.ExternalCut} ExternalCut
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExternalCut.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Operation.ExternalCut();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.enabled = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an ExternalCut message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Operation.ExternalCut
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Operation.ExternalCut} ExternalCut
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExternalCut.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an ExternalCut message.
             * @function verify
             * @memberof pb.Operation.ExternalCut
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ExternalCut.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.enabled != null && message.hasOwnProperty("enabled"))
                    if (typeof message.enabled !== "boolean")
                        return "enabled: boolean expected";
                return null;
            };

            /**
             * Creates an ExternalCut message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Operation.ExternalCut
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Operation.ExternalCut} ExternalCut
             */
            ExternalCut.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Operation.ExternalCut)
                    return object;
                var message = new $root.pb.Operation.ExternalCut();
                if (object.enabled != null)
                    message.enabled = Boolean(object.enabled);
                return message;
            };

            /**
             * Creates a plain object from an ExternalCut message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Operation.ExternalCut
             * @static
             * @param {pb.Operation.ExternalCut} message ExternalCut
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ExternalCut.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.enabled = false;
                if (message.enabled != null && message.hasOwnProperty("enabled"))
                    object.enabled = message.enabled;
                return object;
            };

            /**
             * Converts this ExternalCut to JSON.
             * @function toJSON
             * @memberof pb.Operation.ExternalCut
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ExternalCut.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return ExternalCut;
        })();

        Operation.Clip = (function() {

            /**
             * Properties of a Clip.
             * @memberof pb.Operation
             * @interface IClip
             * @property {pb.IVector3D|null} [pos] Clip pos
             * @property {pb.IVector3D|null} [normal] Clip normal
             */

            /**
             * Constructs a new Clip.
             * @memberof pb.Operation
             * @classdesc Represents a Clip.
             * @implements IClip
             * @constructor
             * @param {pb.Operation.IClip=} [properties] Properties to set
             */
            function Clip(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Clip pos.
             * @member {pb.IVector3D|null|undefined} pos
             * @memberof pb.Operation.Clip
             * @instance
             */
            Clip.prototype.pos = null;

            /**
             * Clip normal.
             * @member {pb.IVector3D|null|undefined} normal
             * @memberof pb.Operation.Clip
             * @instance
             */
            Clip.prototype.normal = null;

            /**
             * Creates a new Clip instance using the specified properties.
             * @function create
             * @memberof pb.Operation.Clip
             * @static
             * @param {pb.Operation.IClip=} [properties] Properties to set
             * @returns {pb.Operation.Clip} Clip instance
             */
            Clip.create = function create(properties) {
                return new Clip(properties);
            };

            /**
             * Encodes the specified Clip message. Does not implicitly {@link pb.Operation.Clip.verify|verify} messages.
             * @function encode
             * @memberof pb.Operation.Clip
             * @static
             * @param {pb.Operation.IClip} message Clip message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Clip.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.pos != null && message.hasOwnProperty("pos"))
                    $root.pb.Vector3D.encode(message.pos, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.normal != null && message.hasOwnProperty("normal"))
                    $root.pb.Vector3D.encode(message.normal, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Clip message, length delimited. Does not implicitly {@link pb.Operation.Clip.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Operation.Clip
             * @static
             * @param {pb.Operation.IClip} message Clip message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Clip.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Clip message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Operation.Clip
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Operation.Clip} Clip
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Clip.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Operation.Clip();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.pos = $root.pb.Vector3D.decode(reader, reader.uint32());
                        break;
                    case 2:
                        message.normal = $root.pb.Vector3D.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Clip message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Operation.Clip
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Operation.Clip} Clip
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Clip.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Clip message.
             * @function verify
             * @memberof pb.Operation.Clip
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Clip.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.pos != null && message.hasOwnProperty("pos")) {
                    var error = $root.pb.Vector3D.verify(message.pos);
                    if (error)
                        return "pos." + error;
                }
                if (message.normal != null && message.hasOwnProperty("normal")) {
                    var error = $root.pb.Vector3D.verify(message.normal);
                    if (error)
                        return "normal." + error;
                }
                return null;
            };

            /**
             * Creates a Clip message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Operation.Clip
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Operation.Clip} Clip
             */
            Clip.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Operation.Clip)
                    return object;
                var message = new $root.pb.Operation.Clip();
                if (object.pos != null) {
                    if (typeof object.pos !== "object")
                        throw TypeError(".pb.Operation.Clip.pos: object expected");
                    message.pos = $root.pb.Vector3D.fromObject(object.pos);
                }
                if (object.normal != null) {
                    if (typeof object.normal !== "object")
                        throw TypeError(".pb.Operation.Clip.normal: object expected");
                    message.normal = $root.pb.Vector3D.fromObject(object.normal);
                }
                return message;
            };

            /**
             * Creates a plain object from a Clip message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Operation.Clip
             * @static
             * @param {pb.Operation.Clip} message Clip
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Clip.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.pos = null;
                    object.normal = null;
                }
                if (message.pos != null && message.hasOwnProperty("pos"))
                    object.pos = $root.pb.Vector3D.toObject(message.pos, options);
                if (message.normal != null && message.hasOwnProperty("normal"))
                    object.normal = $root.pb.Vector3D.toObject(message.normal, options);
                return object;
            };

            /**
             * Converts this Clip to JSON.
             * @function toJSON
             * @memberof pb.Operation.Clip
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Clip.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Clip;
        })();

        Operation.Painting = (function() {

            /**
             * Properties of a Painting.
             * @memberof pb.Operation
             * @interface IPainting
             * @property {pb.IMaterial|null} [material] Painting material
             * @property {Array.<number>|null} [face] Painting face
             */

            /**
             * Constructs a new Painting.
             * @memberof pb.Operation
             * @classdesc Represents a Painting.
             * @implements IPainting
             * @constructor
             * @param {pb.Operation.IPainting=} [properties] Properties to set
             */
            function Painting(properties) {
                this.face = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Painting material.
             * @member {pb.IMaterial|null|undefined} material
             * @memberof pb.Operation.Painting
             * @instance
             */
            Painting.prototype.material = null;

            /**
             * Painting face.
             * @member {Array.<number>} face
             * @memberof pb.Operation.Painting
             * @instance
             */
            Painting.prototype.face = $util.emptyArray;

            /**
             * Creates a new Painting instance using the specified properties.
             * @function create
             * @memberof pb.Operation.Painting
             * @static
             * @param {pb.Operation.IPainting=} [properties] Properties to set
             * @returns {pb.Operation.Painting} Painting instance
             */
            Painting.create = function create(properties) {
                return new Painting(properties);
            };

            /**
             * Encodes the specified Painting message. Does not implicitly {@link pb.Operation.Painting.verify|verify} messages.
             * @function encode
             * @memberof pb.Operation.Painting
             * @static
             * @param {pb.Operation.IPainting} message Painting message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Painting.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.material != null && message.hasOwnProperty("material"))
                    $root.pb.Material.encode(message.material, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.face != null && message.face.length) {
                    writer.uint32(/* id 2, wireType 2 =*/18).fork();
                    for (var i = 0; i < message.face.length; ++i)
                        writer.uint32(message.face[i]);
                    writer.ldelim();
                }
                return writer;
            };

            /**
             * Encodes the specified Painting message, length delimited. Does not implicitly {@link pb.Operation.Painting.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Operation.Painting
             * @static
             * @param {pb.Operation.IPainting} message Painting message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Painting.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Painting message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Operation.Painting
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Operation.Painting} Painting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Painting.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Operation.Painting();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.material = $root.pb.Material.decode(reader, reader.uint32());
                        break;
                    case 2:
                        if (!(message.face && message.face.length))
                            message.face = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.face.push(reader.uint32());
                        } else
                            message.face.push(reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Painting message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Operation.Painting
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Operation.Painting} Painting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Painting.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Painting message.
             * @function verify
             * @memberof pb.Operation.Painting
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Painting.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.material != null && message.hasOwnProperty("material")) {
                    var error = $root.pb.Material.verify(message.material);
                    if (error)
                        return "material." + error;
                }
                if (message.face != null && message.hasOwnProperty("face")) {
                    if (!Array.isArray(message.face))
                        return "face: array expected";
                    for (var i = 0; i < message.face.length; ++i)
                        if (!$util.isInteger(message.face[i]))
                            return "face: integer[] expected";
                }
                return null;
            };

            /**
             * Creates a Painting message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Operation.Painting
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Operation.Painting} Painting
             */
            Painting.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Operation.Painting)
                    return object;
                var message = new $root.pb.Operation.Painting();
                if (object.material != null) {
                    if (typeof object.material !== "object")
                        throw TypeError(".pb.Operation.Painting.material: object expected");
                    message.material = $root.pb.Material.fromObject(object.material);
                }
                if (object.face) {
                    if (!Array.isArray(object.face))
                        throw TypeError(".pb.Operation.Painting.face: array expected");
                    message.face = [];
                    for (var i = 0; i < object.face.length; ++i)
                        message.face[i] = object.face[i] >>> 0;
                }
                return message;
            };

            /**
             * Creates a plain object from a Painting message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Operation.Painting
             * @static
             * @param {pb.Operation.Painting} message Painting
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Painting.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.face = [];
                if (options.defaults)
                    object.material = null;
                if (message.material != null && message.hasOwnProperty("material"))
                    object.material = $root.pb.Material.toObject(message.material, options);
                if (message.face && message.face.length) {
                    object.face = [];
                    for (var j = 0; j < message.face.length; ++j)
                        object.face[j] = message.face[j];
                }
                return object;
            };

            /**
             * Converts this Painting to JSON.
             * @function toJSON
             * @memberof pb.Operation.Painting
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Painting.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Painting;
        })();

        Operation.Hole = (function() {

            /**
             * Properties of a Hole.
             * @memberof pb.Operation
             * @interface IHole
             * @property {pb.IVector3D|null} [pos] Hole pos
             * @property {pb.IVector3D|null} [dir] Hole dir
             * @property {number|null} [depth] Hole depth
             * @property {number|null} [radius] Hole radius
             * @property {pb.Operation.Hole.Mode|null} [mode] Hole mode
             */

            /**
             * Constructs a new Hole.
             * @memberof pb.Operation
             * @classdesc Represents a Hole.
             * @implements IHole
             * @constructor
             * @param {pb.Operation.IHole=} [properties] Properties to set
             */
            function Hole(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Hole pos.
             * @member {pb.IVector3D|null|undefined} pos
             * @memberof pb.Operation.Hole
             * @instance
             */
            Hole.prototype.pos = null;

            /**
             * Hole dir.
             * @member {pb.IVector3D|null|undefined} dir
             * @memberof pb.Operation.Hole
             * @instance
             */
            Hole.prototype.dir = null;

            /**
             * Hole depth.
             * @member {number} depth
             * @memberof pb.Operation.Hole
             * @instance
             */
            Hole.prototype.depth = 0;

            /**
             * Hole radius.
             * @member {number} radius
             * @memberof pb.Operation.Hole
             * @instance
             */
            Hole.prototype.radius = 0;

            /**
             * Hole mode.
             * @member {pb.Operation.Hole.Mode} mode
             * @memberof pb.Operation.Hole
             * @instance
             */
            Hole.prototype.mode = 0;

            /**
             * Creates a new Hole instance using the specified properties.
             * @function create
             * @memberof pb.Operation.Hole
             * @static
             * @param {pb.Operation.IHole=} [properties] Properties to set
             * @returns {pb.Operation.Hole} Hole instance
             */
            Hole.create = function create(properties) {
                return new Hole(properties);
            };

            /**
             * Encodes the specified Hole message. Does not implicitly {@link pb.Operation.Hole.verify|verify} messages.
             * @function encode
             * @memberof pb.Operation.Hole
             * @static
             * @param {pb.Operation.IHole} message Hole message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Hole.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.pos != null && message.hasOwnProperty("pos"))
                    $root.pb.Vector3D.encode(message.pos, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.dir != null && message.hasOwnProperty("dir"))
                    $root.pb.Vector3D.encode(message.dir, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.depth != null && message.hasOwnProperty("depth"))
                    writer.uint32(/* id 3, wireType 1 =*/25).double(message.depth);
                if (message.radius != null && message.hasOwnProperty("radius"))
                    writer.uint32(/* id 4, wireType 1 =*/33).double(message.radius);
                if (message.mode != null && message.hasOwnProperty("mode"))
                    writer.uint32(/* id 5, wireType 0 =*/40).int32(message.mode);
                return writer;
            };

            /**
             * Encodes the specified Hole message, length delimited. Does not implicitly {@link pb.Operation.Hole.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.Operation.Hole
             * @static
             * @param {pb.Operation.IHole} message Hole message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Hole.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Hole message from the specified reader or buffer.
             * @function decode
             * @memberof pb.Operation.Hole
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.Operation.Hole} Hole
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Hole.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.Operation.Hole();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.pos = $root.pb.Vector3D.decode(reader, reader.uint32());
                        break;
                    case 2:
                        message.dir = $root.pb.Vector3D.decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.depth = reader.double();
                        break;
                    case 4:
                        message.radius = reader.double();
                        break;
                    case 5:
                        message.mode = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Hole message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.Operation.Hole
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.Operation.Hole} Hole
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Hole.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Hole message.
             * @function verify
             * @memberof pb.Operation.Hole
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Hole.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.pos != null && message.hasOwnProperty("pos")) {
                    var error = $root.pb.Vector3D.verify(message.pos);
                    if (error)
                        return "pos." + error;
                }
                if (message.dir != null && message.hasOwnProperty("dir")) {
                    var error = $root.pb.Vector3D.verify(message.dir);
                    if (error)
                        return "dir." + error;
                }
                if (message.depth != null && message.hasOwnProperty("depth"))
                    if (typeof message.depth !== "number")
                        return "depth: number expected";
                if (message.radius != null && message.hasOwnProperty("radius"))
                    if (typeof message.radius !== "number")
                        return "radius: number expected";
                if (message.mode != null && message.hasOwnProperty("mode"))
                    switch (message.mode) {
                    default:
                        return "mode: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                return null;
            };

            /**
             * Creates a Hole message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.Operation.Hole
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.Operation.Hole} Hole
             */
            Hole.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.Operation.Hole)
                    return object;
                var message = new $root.pb.Operation.Hole();
                if (object.pos != null) {
                    if (typeof object.pos !== "object")
                        throw TypeError(".pb.Operation.Hole.pos: object expected");
                    message.pos = $root.pb.Vector3D.fromObject(object.pos);
                }
                if (object.dir != null) {
                    if (typeof object.dir !== "object")
                        throw TypeError(".pb.Operation.Hole.dir: object expected");
                    message.dir = $root.pb.Vector3D.fromObject(object.dir);
                }
                if (object.depth != null)
                    message.depth = Number(object.depth);
                if (object.radius != null)
                    message.radius = Number(object.radius);
                switch (object.mode) {
                case "Auto":
                case 0:
                    message.mode = 0;
                    break;
                case "Through":
                case 1:
                    message.mode = 1;
                    break;
                case "Blind":
                case 2:
                    message.mode = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a Hole message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.Operation.Hole
             * @static
             * @param {pb.Operation.Hole} message Hole
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Hole.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.pos = null;
                    object.dir = null;
                    object.depth = 0;
                    object.radius = 0;
                    object.mode = options.enums === String ? "Auto" : 0;
                }
                if (message.pos != null && message.hasOwnProperty("pos"))
                    object.pos = $root.pb.Vector3D.toObject(message.pos, options);
                if (message.dir != null && message.hasOwnProperty("dir"))
                    object.dir = $root.pb.Vector3D.toObject(message.dir, options);
                if (message.depth != null && message.hasOwnProperty("depth"))
                    object.depth = options.json && !isFinite(message.depth) ? String(message.depth) : message.depth;
                if (message.radius != null && message.hasOwnProperty("radius"))
                    object.radius = options.json && !isFinite(message.radius) ? String(message.radius) : message.radius;
                if (message.mode != null && message.hasOwnProperty("mode"))
                    object.mode = options.enums === String ? $root.pb.Operation.Hole.Mode[message.mode] : message.mode;
                return object;
            };

            /**
             * Converts this Hole to JSON.
             * @function toJSON
             * @memberof pb.Operation.Hole
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Hole.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Mode enum.
             * @name pb.Operation.Hole.Mode
             * @enum {string}
             * @property {number} Auto=0 Auto value
             * @property {number} Through=1 Through value
             * @property {number} Blind=2 Blind value
             */
            Hole.Mode = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "Auto"] = 0;
                values[valuesById[1] = "Through"] = 1;
                values[valuesById[2] = "Blind"] = 2;
                return values;
            })();

            return Hole;
        })();

        return Operation;
    })();

    pb.BuilderComponent = (function() {

        /**
         * Properties of a BuilderComponent.
         * @memberof pb
         * @interface IBuilderComponent
         * @property {pb.IBuilder|null} [builder] BuilderComponent builder
         * @property {number|null} [level] BuilderComponent level
         */

        /**
         * Constructs a new BuilderComponent.
         * @memberof pb
         * @classdesc Represents a BuilderComponent.
         * @implements IBuilderComponent
         * @constructor
         * @param {pb.IBuilderComponent=} [properties] Properties to set
         */
        function BuilderComponent(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BuilderComponent builder.
         * @member {pb.IBuilder|null|undefined} builder
         * @memberof pb.BuilderComponent
         * @instance
         */
        BuilderComponent.prototype.builder = null;

        /**
         * BuilderComponent level.
         * @member {number} level
         * @memberof pb.BuilderComponent
         * @instance
         */
        BuilderComponent.prototype.level = 0;

        /**
         * Creates a new BuilderComponent instance using the specified properties.
         * @function create
         * @memberof pb.BuilderComponent
         * @static
         * @param {pb.IBuilderComponent=} [properties] Properties to set
         * @returns {pb.BuilderComponent} BuilderComponent instance
         */
        BuilderComponent.create = function create(properties) {
            return new BuilderComponent(properties);
        };

        /**
         * Encodes the specified BuilderComponent message. Does not implicitly {@link pb.BuilderComponent.verify|verify} messages.
         * @function encode
         * @memberof pb.BuilderComponent
         * @static
         * @param {pb.IBuilderComponent} message BuilderComponent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BuilderComponent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.builder != null && message.hasOwnProperty("builder"))
                $root.pb.Builder.encode(message.builder, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.level != null && message.hasOwnProperty("level"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.level);
            return writer;
        };

        /**
         * Encodes the specified BuilderComponent message, length delimited. Does not implicitly {@link pb.BuilderComponent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.BuilderComponent
         * @static
         * @param {pb.IBuilderComponent} message BuilderComponent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BuilderComponent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BuilderComponent message from the specified reader or buffer.
         * @function decode
         * @memberof pb.BuilderComponent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.BuilderComponent} BuilderComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BuilderComponent.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.BuilderComponent();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.builder = $root.pb.Builder.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.level = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a BuilderComponent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.BuilderComponent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.BuilderComponent} BuilderComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BuilderComponent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BuilderComponent message.
         * @function verify
         * @memberof pb.BuilderComponent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BuilderComponent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.builder != null && message.hasOwnProperty("builder")) {
                var error = $root.pb.Builder.verify(message.builder);
                if (error)
                    return "builder." + error;
            }
            if (message.level != null && message.hasOwnProperty("level"))
                if (!$util.isInteger(message.level))
                    return "level: integer expected";
            return null;
        };

        /**
         * Creates a BuilderComponent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.BuilderComponent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.BuilderComponent} BuilderComponent
         */
        BuilderComponent.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.BuilderComponent)
                return object;
            var message = new $root.pb.BuilderComponent();
            if (object.builder != null) {
                if (typeof object.builder !== "object")
                    throw TypeError(".pb.BuilderComponent.builder: object expected");
                message.builder = $root.pb.Builder.fromObject(object.builder);
            }
            if (object.level != null)
                message.level = object.level | 0;
            return message;
        };

        /**
         * Creates a plain object from a BuilderComponent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.BuilderComponent
         * @static
         * @param {pb.BuilderComponent} message BuilderComponent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BuilderComponent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.builder = null;
                object.level = 0;
            }
            if (message.builder != null && message.hasOwnProperty("builder"))
                object.builder = $root.pb.Builder.toObject(message.builder, options);
            if (message.level != null && message.hasOwnProperty("level"))
                object.level = message.level;
            return object;
        };

        /**
         * Converts this BuilderComponent to JSON.
         * @function toJSON
         * @memberof pb.BuilderComponent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BuilderComponent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return BuilderComponent;
    })();

    pb.FurnitureComponent = (function() {

        /**
         * Properties of a FurnitureComponent.
         * @memberof pb
         * @interface IFurnitureComponent
         * @property {pb.FurnitureComponent.ReferenceMode|null} [reference] FurnitureComponent reference
         * @property {pb.IBuilderOperationList|null} [operations] FurnitureComponent operations
         * @property {Array.<number>|null} [box] FurnitureComponent box
         * @property {boolean|null} [symmetrizable] FurnitureComponent symmetrizable
         * @property {boolean|null} [symmetrized] FurnitureComponent symmetrized
         */

        /**
         * Constructs a new FurnitureComponent.
         * @memberof pb
         * @classdesc Represents a FurnitureComponent.
         * @implements IFurnitureComponent
         * @constructor
         * @param {pb.IFurnitureComponent=} [properties] Properties to set
         */
        function FurnitureComponent(properties) {
            this.box = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FurnitureComponent reference.
         * @member {pb.FurnitureComponent.ReferenceMode} reference
         * @memberof pb.FurnitureComponent
         * @instance
         */
        FurnitureComponent.prototype.reference = 0;

        /**
         * FurnitureComponent operations.
         * @member {pb.IBuilderOperationList|null|undefined} operations
         * @memberof pb.FurnitureComponent
         * @instance
         */
        FurnitureComponent.prototype.operations = null;

        /**
         * FurnitureComponent box.
         * @member {Array.<number>} box
         * @memberof pb.FurnitureComponent
         * @instance
         */
        FurnitureComponent.prototype.box = $util.emptyArray;

        /**
         * FurnitureComponent symmetrizable.
         * @member {boolean} symmetrizable
         * @memberof pb.FurnitureComponent
         * @instance
         */
        FurnitureComponent.prototype.symmetrizable = false;

        /**
         * FurnitureComponent symmetrized.
         * @member {boolean} symmetrized
         * @memberof pb.FurnitureComponent
         * @instance
         */
        FurnitureComponent.prototype.symmetrized = false;

        /**
         * Creates a new FurnitureComponent instance using the specified properties.
         * @function create
         * @memberof pb.FurnitureComponent
         * @static
         * @param {pb.IFurnitureComponent=} [properties] Properties to set
         * @returns {pb.FurnitureComponent} FurnitureComponent instance
         */
        FurnitureComponent.create = function create(properties) {
            return new FurnitureComponent(properties);
        };

        /**
         * Encodes the specified FurnitureComponent message. Does not implicitly {@link pb.FurnitureComponent.verify|verify} messages.
         * @function encode
         * @memberof pb.FurnitureComponent
         * @static
         * @param {pb.IFurnitureComponent} message FurnitureComponent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FurnitureComponent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.reference != null && message.hasOwnProperty("reference"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.reference);
            if (message.operations != null && message.hasOwnProperty("operations"))
                $root.pb.BuilderOperationList.encode(message.operations, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.box != null && message.box.length) {
                writer.uint32(/* id 3, wireType 2 =*/26).fork();
                for (var i = 0; i < message.box.length; ++i)
                    writer.double(message.box[i]);
                writer.ldelim();
            }
            if (message.symmetrizable != null && message.hasOwnProperty("symmetrizable"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.symmetrizable);
            if (message.symmetrized != null && message.hasOwnProperty("symmetrized"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.symmetrized);
            return writer;
        };

        /**
         * Encodes the specified FurnitureComponent message, length delimited. Does not implicitly {@link pb.FurnitureComponent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.FurnitureComponent
         * @static
         * @param {pb.IFurnitureComponent} message FurnitureComponent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FurnitureComponent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FurnitureComponent message from the specified reader or buffer.
         * @function decode
         * @memberof pb.FurnitureComponent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.FurnitureComponent} FurnitureComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FurnitureComponent.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.FurnitureComponent();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.reference = reader.int32();
                    break;
                case 2:
                    message.operations = $root.pb.BuilderOperationList.decode(reader, reader.uint32());
                    break;
                case 3:
                    if (!(message.box && message.box.length))
                        message.box = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.box.push(reader.double());
                    } else
                        message.box.push(reader.double());
                    break;
                case 4:
                    message.symmetrizable = reader.bool();
                    break;
                case 5:
                    message.symmetrized = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a FurnitureComponent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.FurnitureComponent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.FurnitureComponent} FurnitureComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FurnitureComponent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FurnitureComponent message.
         * @function verify
         * @memberof pb.FurnitureComponent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FurnitureComponent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.reference != null && message.hasOwnProperty("reference"))
                switch (message.reference) {
                default:
                    return "reference: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case -1:
                    break;
                }
            if (message.operations != null && message.hasOwnProperty("operations")) {
                var error = $root.pb.BuilderOperationList.verify(message.operations);
                if (error)
                    return "operations." + error;
            }
            if (message.box != null && message.hasOwnProperty("box")) {
                if (!Array.isArray(message.box))
                    return "box: array expected";
                for (var i = 0; i < message.box.length; ++i)
                    if (typeof message.box[i] !== "number")
                        return "box: number[] expected";
            }
            if (message.symmetrizable != null && message.hasOwnProperty("symmetrizable"))
                if (typeof message.symmetrizable !== "boolean")
                    return "symmetrizable: boolean expected";
            if (message.symmetrized != null && message.hasOwnProperty("symmetrized"))
                if (typeof message.symmetrized !== "boolean")
                    return "symmetrized: boolean expected";
            return null;
        };

        /**
         * Creates a FurnitureComponent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.FurnitureComponent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.FurnitureComponent} FurnitureComponent
         */
        FurnitureComponent.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.FurnitureComponent)
                return object;
            var message = new $root.pb.FurnitureComponent();
            switch (object.reference) {
            case "Plane":
            case 0:
                message.reference = 0;
                break;
            case "PlanePlane":
            case 1:
                message.reference = 1;
                break;
            case "PlaneSide":
            case 2:
                message.reference = 2;
                break;
            case "Box":
            case 3:
                message.reference = 3;
                break;
            case "Joint":
            case 4:
                message.reference = 4;
                break;
            case "None":
            case -1:
                message.reference = -1;
                break;
            }
            if (object.operations != null) {
                if (typeof object.operations !== "object")
                    throw TypeError(".pb.FurnitureComponent.operations: object expected");
                message.operations = $root.pb.BuilderOperationList.fromObject(object.operations);
            }
            if (object.box) {
                if (!Array.isArray(object.box))
                    throw TypeError(".pb.FurnitureComponent.box: array expected");
                message.box = [];
                for (var i = 0; i < object.box.length; ++i)
                    message.box[i] = Number(object.box[i]);
            }
            if (object.symmetrizable != null)
                message.symmetrizable = Boolean(object.symmetrizable);
            if (object.symmetrized != null)
                message.symmetrized = Boolean(object.symmetrized);
            return message;
        };

        /**
         * Creates a plain object from a FurnitureComponent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.FurnitureComponent
         * @static
         * @param {pb.FurnitureComponent} message FurnitureComponent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FurnitureComponent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.box = [];
            if (options.defaults) {
                object.reference = options.enums === String ? "Plane" : 0;
                object.operations = null;
                object.symmetrizable = false;
                object.symmetrized = false;
            }
            if (message.reference != null && message.hasOwnProperty("reference"))
                object.reference = options.enums === String ? $root.pb.FurnitureComponent.ReferenceMode[message.reference] : message.reference;
            if (message.operations != null && message.hasOwnProperty("operations"))
                object.operations = $root.pb.BuilderOperationList.toObject(message.operations, options);
            if (message.box && message.box.length) {
                object.box = [];
                for (var j = 0; j < message.box.length; ++j)
                    object.box[j] = options.json && !isFinite(message.box[j]) ? String(message.box[j]) : message.box[j];
            }
            if (message.symmetrizable != null && message.hasOwnProperty("symmetrizable"))
                object.symmetrizable = message.symmetrizable;
            if (message.symmetrized != null && message.hasOwnProperty("symmetrized"))
                object.symmetrized = message.symmetrized;
            return object;
        };

        /**
         * Converts this FurnitureComponent to JSON.
         * @function toJSON
         * @memberof pb.FurnitureComponent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FurnitureComponent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * ReferenceMode enum.
         * @name pb.FurnitureComponent.ReferenceMode
         * @enum {string}
         * @property {number} Plane=0 Plane value
         * @property {number} PlanePlane=1 PlanePlane value
         * @property {number} PlaneSide=2 PlaneSide value
         * @property {number} Box=3 Box value
         * @property {number} Joint=4 Joint value
         * @property {number} None=-1 None value
         */
        FurnitureComponent.ReferenceMode = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "Plane"] = 0;
            values[valuesById[1] = "PlanePlane"] = 1;
            values[valuesById[2] = "PlaneSide"] = 2;
            values[valuesById[3] = "Box"] = 3;
            values[valuesById[4] = "Joint"] = 4;
            values[valuesById[-1] = "None"] = -1;
            return values;
        })();

        return FurnitureComponent;
    })();

    pb.BuilderLinkComponent = (function() {

        /**
         * Properties of a BuilderLinkComponent.
         * @memberof pb
         * @interface IBuilderLinkComponent
         * @property {Array.<pb.BuilderLinkComponent.ILink>|null} [link] BuilderLinkComponent link
         * @property {number|Long|null} [cutLink] BuilderLinkComponent cutLink
         */

        /**
         * Constructs a new BuilderLinkComponent.
         * @memberof pb
         * @classdesc Represents a BuilderLinkComponent.
         * @implements IBuilderLinkComponent
         * @constructor
         * @param {pb.IBuilderLinkComponent=} [properties] Properties to set
         */
        function BuilderLinkComponent(properties) {
            this.link = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BuilderLinkComponent link.
         * @member {Array.<pb.BuilderLinkComponent.ILink>} link
         * @memberof pb.BuilderLinkComponent
         * @instance
         */
        BuilderLinkComponent.prototype.link = $util.emptyArray;

        /**
         * BuilderLinkComponent cutLink.
         * @member {number|Long} cutLink
         * @memberof pb.BuilderLinkComponent
         * @instance
         */
        BuilderLinkComponent.prototype.cutLink = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new BuilderLinkComponent instance using the specified properties.
         * @function create
         * @memberof pb.BuilderLinkComponent
         * @static
         * @param {pb.IBuilderLinkComponent=} [properties] Properties to set
         * @returns {pb.BuilderLinkComponent} BuilderLinkComponent instance
         */
        BuilderLinkComponent.create = function create(properties) {
            return new BuilderLinkComponent(properties);
        };

        /**
         * Encodes the specified BuilderLinkComponent message. Does not implicitly {@link pb.BuilderLinkComponent.verify|verify} messages.
         * @function encode
         * @memberof pb.BuilderLinkComponent
         * @static
         * @param {pb.IBuilderLinkComponent} message BuilderLinkComponent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BuilderLinkComponent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.link != null && message.link.length)
                for (var i = 0; i < message.link.length; ++i)
                    $root.pb.BuilderLinkComponent.Link.encode(message.link[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.cutLink != null && message.hasOwnProperty("cutLink"))
                writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.cutLink);
            return writer;
        };

        /**
         * Encodes the specified BuilderLinkComponent message, length delimited. Does not implicitly {@link pb.BuilderLinkComponent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.BuilderLinkComponent
         * @static
         * @param {pb.IBuilderLinkComponent} message BuilderLinkComponent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BuilderLinkComponent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BuilderLinkComponent message from the specified reader or buffer.
         * @function decode
         * @memberof pb.BuilderLinkComponent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.BuilderLinkComponent} BuilderLinkComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BuilderLinkComponent.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.BuilderLinkComponent();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.link && message.link.length))
                        message.link = [];
                    message.link.push($root.pb.BuilderLinkComponent.Link.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.cutLink = reader.fixed64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a BuilderLinkComponent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.BuilderLinkComponent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.BuilderLinkComponent} BuilderLinkComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BuilderLinkComponent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BuilderLinkComponent message.
         * @function verify
         * @memberof pb.BuilderLinkComponent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BuilderLinkComponent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.link != null && message.hasOwnProperty("link")) {
                if (!Array.isArray(message.link))
                    return "link: array expected";
                for (var i = 0; i < message.link.length; ++i) {
                    var error = $root.pb.BuilderLinkComponent.Link.verify(message.link[i]);
                    if (error)
                        return "link." + error;
                }
            }
            if (message.cutLink != null && message.hasOwnProperty("cutLink"))
                if (!$util.isInteger(message.cutLink) && !(message.cutLink && $util.isInteger(message.cutLink.low) && $util.isInteger(message.cutLink.high)))
                    return "cutLink: integer|Long expected";
            return null;
        };

        /**
         * Creates a BuilderLinkComponent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.BuilderLinkComponent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.BuilderLinkComponent} BuilderLinkComponent
         */
        BuilderLinkComponent.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.BuilderLinkComponent)
                return object;
            var message = new $root.pb.BuilderLinkComponent();
            if (object.link) {
                if (!Array.isArray(object.link))
                    throw TypeError(".pb.BuilderLinkComponent.link: array expected");
                message.link = [];
                for (var i = 0; i < object.link.length; ++i) {
                    if (typeof object.link[i] !== "object")
                        throw TypeError(".pb.BuilderLinkComponent.link: object expected");
                    message.link[i] = $root.pb.BuilderLinkComponent.Link.fromObject(object.link[i]);
                }
            }
            if (object.cutLink != null)
                if ($util.Long)
                    (message.cutLink = $util.Long.fromValue(object.cutLink)).unsigned = false;
                else if (typeof object.cutLink === "string")
                    message.cutLink = parseInt(object.cutLink, 10);
                else if (typeof object.cutLink === "number")
                    message.cutLink = object.cutLink;
                else if (typeof object.cutLink === "object")
                    message.cutLink = new $util.LongBits(object.cutLink.low >>> 0, object.cutLink.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a BuilderLinkComponent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.BuilderLinkComponent
         * @static
         * @param {pb.BuilderLinkComponent} message BuilderLinkComponent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BuilderLinkComponent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.link = [];
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.cutLink = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.cutLink = options.longs === String ? "0" : 0;
            if (message.link && message.link.length) {
                object.link = [];
                for (var j = 0; j < message.link.length; ++j)
                    object.link[j] = $root.pb.BuilderLinkComponent.Link.toObject(message.link[j], options);
            }
            if (message.cutLink != null && message.hasOwnProperty("cutLink"))
                if (typeof message.cutLink === "number")
                    object.cutLink = options.longs === String ? String(message.cutLink) : message.cutLink;
                else
                    object.cutLink = options.longs === String ? $util.Long.prototype.toString.call(message.cutLink) : options.longs === Number ? new $util.LongBits(message.cutLink.low >>> 0, message.cutLink.high >>> 0).toNumber() : message.cutLink;
            return object;
        };

        /**
         * Converts this BuilderLinkComponent to JSON.
         * @function toJSON
         * @memberof pb.BuilderLinkComponent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BuilderLinkComponent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        BuilderLinkComponent.Link = (function() {

            /**
             * Properties of a Link.
             * @memberof pb.BuilderLinkComponent
             * @interface ILink
             * @property {number|Long|null} [entity] Link entity
             * @property {number|Long|null} [revision] Link revision
             */

            /**
             * Constructs a new Link.
             * @memberof pb.BuilderLinkComponent
             * @classdesc Represents a Link.
             * @implements ILink
             * @constructor
             * @param {pb.BuilderLinkComponent.ILink=} [properties] Properties to set
             */
            function Link(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Link entity.
             * @member {number|Long} entity
             * @memberof pb.BuilderLinkComponent.Link
             * @instance
             */
            Link.prototype.entity = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Link revision.
             * @member {number|Long} revision
             * @memberof pb.BuilderLinkComponent.Link
             * @instance
             */
            Link.prototype.revision = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Link instance using the specified properties.
             * @function create
             * @memberof pb.BuilderLinkComponent.Link
             * @static
             * @param {pb.BuilderLinkComponent.ILink=} [properties] Properties to set
             * @returns {pb.BuilderLinkComponent.Link} Link instance
             */
            Link.create = function create(properties) {
                return new Link(properties);
            };

            /**
             * Encodes the specified Link message. Does not implicitly {@link pb.BuilderLinkComponent.Link.verify|verify} messages.
             * @function encode
             * @memberof pb.BuilderLinkComponent.Link
             * @static
             * @param {pb.BuilderLinkComponent.ILink} message Link message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Link.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.entity != null && message.hasOwnProperty("entity"))
                    writer.uint32(/* id 1, wireType 1 =*/9).fixed64(message.entity);
                if (message.revision != null && message.hasOwnProperty("revision"))
                    writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.revision);
                return writer;
            };

            /**
             * Encodes the specified Link message, length delimited. Does not implicitly {@link pb.BuilderLinkComponent.Link.verify|verify} messages.
             * @function encodeDelimited
             * @memberof pb.BuilderLinkComponent.Link
             * @static
             * @param {pb.BuilderLinkComponent.ILink} message Link message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Link.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Link message from the specified reader or buffer.
             * @function decode
             * @memberof pb.BuilderLinkComponent.Link
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {pb.BuilderLinkComponent.Link} Link
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Link.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.BuilderLinkComponent.Link();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.entity = reader.fixed64();
                        break;
                    case 2:
                        message.revision = reader.fixed64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Link message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof pb.BuilderLinkComponent.Link
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {pb.BuilderLinkComponent.Link} Link
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Link.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Link message.
             * @function verify
             * @memberof pb.BuilderLinkComponent.Link
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Link.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.entity != null && message.hasOwnProperty("entity"))
                    if (!$util.isInteger(message.entity) && !(message.entity && $util.isInteger(message.entity.low) && $util.isInteger(message.entity.high)))
                        return "entity: integer|Long expected";
                if (message.revision != null && message.hasOwnProperty("revision"))
                    if (!$util.isInteger(message.revision) && !(message.revision && $util.isInteger(message.revision.low) && $util.isInteger(message.revision.high)))
                        return "revision: integer|Long expected";
                return null;
            };

            /**
             * Creates a Link message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof pb.BuilderLinkComponent.Link
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {pb.BuilderLinkComponent.Link} Link
             */
            Link.fromObject = function fromObject(object) {
                if (object instanceof $root.pb.BuilderLinkComponent.Link)
                    return object;
                var message = new $root.pb.BuilderLinkComponent.Link();
                if (object.entity != null)
                    if ($util.Long)
                        (message.entity = $util.Long.fromValue(object.entity)).unsigned = false;
                    else if (typeof object.entity === "string")
                        message.entity = parseInt(object.entity, 10);
                    else if (typeof object.entity === "number")
                        message.entity = object.entity;
                    else if (typeof object.entity === "object")
                        message.entity = new $util.LongBits(object.entity.low >>> 0, object.entity.high >>> 0).toNumber();
                if (object.revision != null)
                    if ($util.Long)
                        (message.revision = $util.Long.fromValue(object.revision)).unsigned = false;
                    else if (typeof object.revision === "string")
                        message.revision = parseInt(object.revision, 10);
                    else if (typeof object.revision === "number")
                        message.revision = object.revision;
                    else if (typeof object.revision === "object")
                        message.revision = new $util.LongBits(object.revision.low >>> 0, object.revision.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a Link message. Also converts values to other types if specified.
             * @function toObject
             * @memberof pb.BuilderLinkComponent.Link
             * @static
             * @param {pb.BuilderLinkComponent.Link} message Link
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Link.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.entity = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.entity = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.revision = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.revision = options.longs === String ? "0" : 0;
                }
                if (message.entity != null && message.hasOwnProperty("entity"))
                    if (typeof message.entity === "number")
                        object.entity = options.longs === String ? String(message.entity) : message.entity;
                    else
                        object.entity = options.longs === String ? $util.Long.prototype.toString.call(message.entity) : options.longs === Number ? new $util.LongBits(message.entity.low >>> 0, message.entity.high >>> 0).toNumber() : message.entity;
                if (message.revision != null && message.hasOwnProperty("revision"))
                    if (typeof message.revision === "number")
                        object.revision = options.longs === String ? String(message.revision) : message.revision;
                    else
                        object.revision = options.longs === String ? $util.Long.prototype.toString.call(message.revision) : options.longs === Number ? new $util.LongBits(message.revision.low >>> 0, message.revision.high >>> 0).toNumber() : message.revision;
                return object;
            };

            /**
             * Converts this Link to JSON.
             * @function toJSON
             * @memberof pb.BuilderLinkComponent.Link
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Link.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Link;
        })();

        return BuilderLinkComponent;
    })();

    pb.ModelInsertInfo = (function() {

        /**
         * Properties of a ModelInsertInfo.
         * @memberof pb
         * @interface IModelInsertInfo
         * @property {number|null} [flags] ModelInsertInfo flags
         * @property {Array.<number>|null} [box] ModelInsertInfo box
         * @property {string|null} [type] ModelInsertInfo type
         */

        /**
         * Constructs a new ModelInsertInfo.
         * @memberof pb
         * @classdesc Represents a ModelInsertInfo.
         * @implements IModelInsertInfo
         * @constructor
         * @param {pb.IModelInsertInfo=} [properties] Properties to set
         */
        function ModelInsertInfo(properties) {
            this.box = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ModelInsertInfo flags.
         * @member {number} flags
         * @memberof pb.ModelInsertInfo
         * @instance
         */
        ModelInsertInfo.prototype.flags = 0;

        /**
         * ModelInsertInfo box.
         * @member {Array.<number>} box
         * @memberof pb.ModelInsertInfo
         * @instance
         */
        ModelInsertInfo.prototype.box = $util.emptyArray;

        /**
         * ModelInsertInfo type.
         * @member {string} type
         * @memberof pb.ModelInsertInfo
         * @instance
         */
        ModelInsertInfo.prototype.type = "";

        /**
         * Creates a new ModelInsertInfo instance using the specified properties.
         * @function create
         * @memberof pb.ModelInsertInfo
         * @static
         * @param {pb.IModelInsertInfo=} [properties] Properties to set
         * @returns {pb.ModelInsertInfo} ModelInsertInfo instance
         */
        ModelInsertInfo.create = function create(properties) {
            return new ModelInsertInfo(properties);
        };

        /**
         * Encodes the specified ModelInsertInfo message. Does not implicitly {@link pb.ModelInsertInfo.verify|verify} messages.
         * @function encode
         * @memberof pb.ModelInsertInfo
         * @static
         * @param {pb.IModelInsertInfo} message ModelInsertInfo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ModelInsertInfo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.flags != null && message.hasOwnProperty("flags"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.flags);
            if (message.box != null && message.box.length) {
                writer.uint32(/* id 2, wireType 2 =*/18).fork();
                for (var i = 0; i < message.box.length; ++i)
                    writer.float(message.box[i]);
                writer.ldelim();
            }
            if (message.type != null && message.hasOwnProperty("type"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
            return writer;
        };

        /**
         * Encodes the specified ModelInsertInfo message, length delimited. Does not implicitly {@link pb.ModelInsertInfo.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb.ModelInsertInfo
         * @static
         * @param {pb.IModelInsertInfo} message ModelInsertInfo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ModelInsertInfo.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ModelInsertInfo message from the specified reader or buffer.
         * @function decode
         * @memberof pb.ModelInsertInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb.ModelInsertInfo} ModelInsertInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ModelInsertInfo.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb.ModelInsertInfo();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.flags = reader.uint32();
                    break;
                case 2:
                    if (!(message.box && message.box.length))
                        message.box = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.box.push(reader.float());
                    } else
                        message.box.push(reader.float());
                    break;
                case 3:
                    message.type = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ModelInsertInfo message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb.ModelInsertInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb.ModelInsertInfo} ModelInsertInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ModelInsertInfo.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ModelInsertInfo message.
         * @function verify
         * @memberof pb.ModelInsertInfo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ModelInsertInfo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.flags != null && message.hasOwnProperty("flags"))
                if (!$util.isInteger(message.flags))
                    return "flags: integer expected";
            if (message.box != null && message.hasOwnProperty("box")) {
                if (!Array.isArray(message.box))
                    return "box: array expected";
                for (var i = 0; i < message.box.length; ++i)
                    if (typeof message.box[i] !== "number")
                        return "box: number[] expected";
            }
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            return null;
        };

        /**
         * Creates a ModelInsertInfo message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof pb.ModelInsertInfo
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {pb.ModelInsertInfo} ModelInsertInfo
         */
        ModelInsertInfo.fromObject = function fromObject(object) {
            if (object instanceof $root.pb.ModelInsertInfo)
                return object;
            var message = new $root.pb.ModelInsertInfo();
            if (object.flags != null)
                message.flags = object.flags >>> 0;
            if (object.box) {
                if (!Array.isArray(object.box))
                    throw TypeError(".pb.ModelInsertInfo.box: array expected");
                message.box = [];
                for (var i = 0; i < object.box.length; ++i)
                    message.box[i] = Number(object.box[i]);
            }
            if (object.type != null)
                message.type = String(object.type);
            return message;
        };

        /**
         * Creates a plain object from a ModelInsertInfo message. Also converts values to other types if specified.
         * @function toObject
         * @memberof pb.ModelInsertInfo
         * @static
         * @param {pb.ModelInsertInfo} message ModelInsertInfo
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ModelInsertInfo.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.box = [];
            if (options.defaults) {
                object.flags = 0;
                object.type = "";
            }
            if (message.flags != null && message.hasOwnProperty("flags"))
                object.flags = message.flags;
            if (message.box && message.box.length) {
                object.box = [];
                for (var j = 0; j < message.box.length; ++j)
                    object.box[j] = options.json && !isFinite(message.box[j]) ? String(message.box[j]) : message.box[j];
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            return object;
        };

        /**
         * Converts this ModelInsertInfo to JSON.
         * @function toJSON
         * @memberof pb.ModelInsertInfo
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ModelInsertInfo.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ModelInsertInfo;
    })();

    return pb;
})();

module.exports = $root;
