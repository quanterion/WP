import * as $protobuf from "protobufjs";
/** Namespace pb. */
export namespace pb {

    /** Properties of a Common. */
    interface ICommon {

        /** Common name */
        name?: (string|null);

        /** Common type */
        type?: (string|null);

        /** Common catalog */
        catalog?: (number|null);

        /** Common assembly */
        assembly?: (boolean|null);

        /** Common layer */
        layer?: (string|null);

        /** Common group */
        group?: (number|null);
    }

    /** Represents a Common. */
    class Common implements ICommon {

        /**
         * Constructs a new Common.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.ICommon);

        /** Common name. */
        public name: string;

        /** Common type. */
        public type: string;

        /** Common catalog. */
        public catalog: number;

        /** Common assembly. */
        public assembly: boolean;

        /** Common layer. */
        public layer: string;

        /** Common group. */
        public group: number;

        /**
         * Creates a new Common instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Common instance
         */
        public static create(properties?: pb.ICommon): pb.Common;

        /**
         * Encodes the specified Common message. Does not implicitly {@link pb.Common.verify|verify} messages.
         * @param message Common message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.ICommon, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Common message, length delimited. Does not implicitly {@link pb.Common.verify|verify} messages.
         * @param message Common message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.ICommon, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Common message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Common
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Common;

        /**
         * Decodes a Common message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Common
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Common;

        /**
         * Verifies a Common message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Common message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Common
         */
        public static fromObject(object: { [k: string]: any }): pb.Common;

        /**
         * Creates a plain object from a Common message. Also converts values to other types if specified.
         * @param message Common
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Common, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Common to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Transform. */
    interface ITransform {

        /** Transform matrix */
        matrix?: (number[]|null);

        /** Transform flags */
        flags?: (number|null);

        /** Transform box */
        box?: (number[]|null);

        /** Transform contentBox */
        contentBox?: (number[]|null);

        /** Transform exactBox */
        exactBox?: (number[]|null);
    }

    /** Represents a Transform. */
    class Transform implements ITransform {

        /**
         * Constructs a new Transform.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.ITransform);

        /** Transform matrix. */
        public matrix: number[];

        /** Transform flags. */
        public flags: number;

        /** Transform box. */
        public box: number[];

        /** Transform contentBox. */
        public contentBox: number[];

        /** Transform exactBox. */
        public exactBox: number[];

        /**
         * Creates a new Transform instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Transform instance
         */
        public static create(properties?: pb.ITransform): pb.Transform;

        /**
         * Encodes the specified Transform message. Does not implicitly {@link pb.Transform.verify|verify} messages.
         * @param message Transform message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.ITransform, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Transform message, length delimited. Does not implicitly {@link pb.Transform.verify|verify} messages.
         * @param message Transform message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.ITransform, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Transform message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Transform
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Transform;

        /**
         * Decodes a Transform message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Transform
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Transform;

        /**
         * Verifies a Transform message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Transform message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Transform
         */
        public static fromObject(object: { [k: string]: any }): pb.Transform;

        /**
         * Creates a plain object from a Transform message. Also converts values to other types if specified.
         * @param message Transform
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Transform, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Transform to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Geometry. */
    interface IGeometry {

        /** Geometry grid */
        grid?: (pb.Geometry.IGrid[]|null);

        /** Geometry edge */
        edge?: (pb.Geometry.IEdge[]|null);

        /** Geometry materials */
        materials?: (string|null);
    }

    /** Represents a Geometry. */
    class Geometry implements IGeometry {

        /**
         * Constructs a new Geometry.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IGeometry);

        /** Geometry grid. */
        public grid: pb.Geometry.IGrid[];

        /** Geometry edge. */
        public edge: pb.Geometry.IEdge[];

        /** Geometry materials. */
        public materials: string;

        /**
         * Creates a new Geometry instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Geometry instance
         */
        public static create(properties?: pb.IGeometry): pb.Geometry;

        /**
         * Encodes the specified Geometry message. Does not implicitly {@link pb.Geometry.verify|verify} messages.
         * @param message Geometry message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IGeometry, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Geometry message, length delimited. Does not implicitly {@link pb.Geometry.verify|verify} messages.
         * @param message Geometry message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IGeometry, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Geometry message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Geometry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Geometry;

        /**
         * Decodes a Geometry message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Geometry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Geometry;

        /**
         * Verifies a Geometry message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Geometry message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Geometry
         */
        public static fromObject(object: { [k: string]: any }): pb.Geometry;

        /**
         * Creates a plain object from a Geometry message. Also converts values to other types if specified.
         * @param message Geometry
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Geometry, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Geometry to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Geometry {

        /** Properties of a Grid. */
        interface IGrid {

            /** Grid name */
            name?: (number|null);

            /** Grid catalog */
            catalog?: (number|null);

            /** Grid material */
            material?: (string|null);

            /** Grid type */
            type?: (number|null);

            /** Grid swapuv */
            swapuv?: (boolean|null);

            /** Grid position */
            position?: (number[]|null);

            /** Grid normal */
            normal?: (number[]|null);

            /** Grid texture */
            texture?: (number[]|null);

            /** Grid index */
            index?: (number[]|null);

            /** Grid draco */
            draco?: (Uint8Array|null);

            /** Grid size */
            size?: (number[]|null);
        }

        /** Represents a Grid. */
        class Grid implements IGrid {

            /**
             * Constructs a new Grid.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Geometry.IGrid);

            /** Grid name. */
            public name: number;

            /** Grid catalog. */
            public catalog: number;

            /** Grid material. */
            public material: string;

            /** Grid type. */
            public type: number;

            /** Grid swapuv. */
            public swapuv: boolean;

            /** Grid position. */
            public position: number[];

            /** Grid normal. */
            public normal: number[];

            /** Grid texture. */
            public texture: number[];

            /** Grid index. */
            public index: number[];

            /** Grid draco. */
            public draco: Uint8Array;

            /** Grid size. */
            public size: number[];

            /**
             * Creates a new Grid instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Grid instance
             */
            public static create(properties?: pb.Geometry.IGrid): pb.Geometry.Grid;

            /**
             * Encodes the specified Grid message. Does not implicitly {@link pb.Geometry.Grid.verify|verify} messages.
             * @param message Grid message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Geometry.IGrid, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Grid message, length delimited. Does not implicitly {@link pb.Geometry.Grid.verify|verify} messages.
             * @param message Grid message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Geometry.IGrid, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Grid message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Grid
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Geometry.Grid;

            /**
             * Decodes a Grid message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Grid
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Geometry.Grid;

            /**
             * Verifies a Grid message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Grid message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Grid
             */
            public static fromObject(object: { [k: string]: any }): pb.Geometry.Grid;

            /**
             * Creates a plain object from a Grid message. Also converts values to other types if specified.
             * @param message Grid
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Geometry.Grid, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Grid to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an Edge. */
        interface IEdge {

            /** Edge position */
            position?: (number[]|null);
        }

        /** Represents an Edge. */
        class Edge implements IEdge {

            /**
             * Constructs a new Edge.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Geometry.IEdge);

            /** Edge position. */
            public position: number[];

            /**
             * Creates a new Edge instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Edge instance
             */
            public static create(properties?: pb.Geometry.IEdge): pb.Geometry.Edge;

            /**
             * Encodes the specified Edge message. Does not implicitly {@link pb.Geometry.Edge.verify|verify} messages.
             * @param message Edge message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Geometry.IEdge, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Edge message, length delimited. Does not implicitly {@link pb.Geometry.Edge.verify|verify} messages.
             * @param message Edge message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Geometry.IEdge, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Edge message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Edge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Geometry.Edge;

            /**
             * Decodes an Edge message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Edge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Geometry.Edge;

            /**
             * Verifies an Edge message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Edge message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Edge
             */
            public static fromObject(object: { [k: string]: any }): pb.Geometry.Edge;

            /**
             * Creates a plain object from an Edge message. Also converts values to other types if specified.
             * @param message Edge
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Geometry.Edge, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Edge to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of an Edges. */
    interface IEdges {

        /** Edges edge */
        edge?: (pb.Edges.IEdge[]|null);
    }

    /** Represents an Edges. */
    class Edges implements IEdges {

        /**
         * Constructs a new Edges.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IEdges);

        /** Edges edge. */
        public edge: pb.Edges.IEdge[];

        /**
         * Creates a new Edges instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Edges instance
         */
        public static create(properties?: pb.IEdges): pb.Edges;

        /**
         * Encodes the specified Edges message. Does not implicitly {@link pb.Edges.verify|verify} messages.
         * @param message Edges message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IEdges, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Edges message, length delimited. Does not implicitly {@link pb.Edges.verify|verify} messages.
         * @param message Edges message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IEdges, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Edges message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Edges
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Edges;

        /**
         * Decodes an Edges message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Edges
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Edges;

        /**
         * Verifies an Edges message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Edges message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Edges
         */
        public static fromObject(object: { [k: string]: any }): pb.Edges;

        /**
         * Creates a plain object from an Edges message. Also converts values to other types if specified.
         * @param message Edges
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Edges, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Edges to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Edges {

        /** Properties of an Edge. */
        interface IEdge {

            /** Edge position */
            position?: (number[]|null);
        }

        /** Represents an Edge. */
        class Edge implements IEdge {

            /**
             * Constructs a new Edge.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Edges.IEdge);

            /** Edge position. */
            public position: number[];

            /**
             * Creates a new Edge instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Edge instance
             */
            public static create(properties?: pb.Edges.IEdge): pb.Edges.Edge;

            /**
             * Encodes the specified Edge message. Does not implicitly {@link pb.Edges.Edge.verify|verify} messages.
             * @param message Edge message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Edges.IEdge, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Edge message, length delimited. Does not implicitly {@link pb.Edges.Edge.verify|verify} messages.
             * @param message Edge message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Edges.IEdge, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Edge message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Edge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Edges.Edge;

            /**
             * Decodes an Edge message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Edge
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Edges.Edge;

            /**
             * Verifies an Edge message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Edge message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Edge
             */
            public static fromObject(object: { [k: string]: any }): pb.Edges.Edge;

            /**
             * Creates a plain object from an Edge message. Also converts values to other types if specified.
             * @param message Edge
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Edges.Edge, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Edge to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of an Animation. */
    interface IAnimation {

        /** Animation entity */
        entity?: (string|null);

        /** Animation frame */
        frame?: (pb.Animation.IFrame[]|null);
    }

    /** Represents an Animation. */
    class Animation implements IAnimation {

        /**
         * Constructs a new Animation.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IAnimation);

        /** Animation entity. */
        public entity: string;

        /** Animation frame. */
        public frame: pb.Animation.IFrame[];

        /**
         * Creates a new Animation instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Animation instance
         */
        public static create(properties?: pb.IAnimation): pb.Animation;

        /**
         * Encodes the specified Animation message. Does not implicitly {@link pb.Animation.verify|verify} messages.
         * @param message Animation message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IAnimation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Animation message, length delimited. Does not implicitly {@link pb.Animation.verify|verify} messages.
         * @param message Animation message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IAnimation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Animation message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Animation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Animation;

        /**
         * Decodes an Animation message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Animation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Animation;

        /**
         * Verifies an Animation message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Animation message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Animation
         */
        public static fromObject(object: { [k: string]: any }): pb.Animation;

        /**
         * Creates a plain object from an Animation message. Also converts values to other types if specified.
         * @param message Animation
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Animation, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Animation to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Animation {

        /** Properties of a Frame. */
        interface IFrame {

            /** Frame move */
            move?: (number[]|null);

            /** Frame axis */
            axis?: (number[]|null);

            /** Frame angle */
            angle?: (number|null);

            /** Frame length */
            length?: (number|null);
        }

        /** Represents a Frame. */
        class Frame implements IFrame {

            /**
             * Constructs a new Frame.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Animation.IFrame);

            /** Frame move. */
            public move: number[];

            /** Frame axis. */
            public axis: number[];

            /** Frame angle. */
            public angle: number;

            /** Frame length. */
            public length: number;

            /**
             * Creates a new Frame instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Frame instance
             */
            public static create(properties?: pb.Animation.IFrame): pb.Animation.Frame;

            /**
             * Encodes the specified Frame message. Does not implicitly {@link pb.Animation.Frame.verify|verify} messages.
             * @param message Frame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Animation.IFrame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Frame message, length delimited. Does not implicitly {@link pb.Animation.Frame.verify|verify} messages.
             * @param message Frame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Animation.IFrame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Frame message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Frame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Animation.Frame;

            /**
             * Decodes a Frame message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Frame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Animation.Frame;

            /**
             * Verifies a Frame message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Frame message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Frame
             */
            public static fromObject(object: { [k: string]: any }): pb.Animation.Frame;

            /**
             * Creates a plain object from a Frame message. Also converts values to other types if specified.
             * @param message Frame
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Animation.Frame, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Frame to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a CompoundAnimation. */
    interface ICompoundAnimation {

        /** CompoundAnimation item */
        item?: (pb.IAnimation[]|null);

        /** CompoundAnimation length */
        length?: (number|null);
    }

    /** Represents a CompoundAnimation. */
    class CompoundAnimation implements ICompoundAnimation {

        /**
         * Constructs a new CompoundAnimation.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.ICompoundAnimation);

        /** CompoundAnimation item. */
        public item: pb.IAnimation[];

        /** CompoundAnimation length. */
        public length: number;

        /**
         * Creates a new CompoundAnimation instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CompoundAnimation instance
         */
        public static create(properties?: pb.ICompoundAnimation): pb.CompoundAnimation;

        /**
         * Encodes the specified CompoundAnimation message. Does not implicitly {@link pb.CompoundAnimation.verify|verify} messages.
         * @param message CompoundAnimation message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.ICompoundAnimation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CompoundAnimation message, length delimited. Does not implicitly {@link pb.CompoundAnimation.verify|verify} messages.
         * @param message CompoundAnimation message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.ICompoundAnimation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CompoundAnimation message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CompoundAnimation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.CompoundAnimation;

        /**
         * Decodes a CompoundAnimation message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CompoundAnimation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.CompoundAnimation;

        /**
         * Verifies a CompoundAnimation message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CompoundAnimation message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CompoundAnimation
         */
        public static fromObject(object: { [k: string]: any }): pb.CompoundAnimation;

        /**
         * Creates a plain object from a CompoundAnimation message. Also converts values to other types if specified.
         * @param message CompoundAnimation
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.CompoundAnimation, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CompoundAnimation to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an Elastic. */
    interface IElastic {

        /** Elastic size */
        size?: (number[]|null);

        /** Elastic x */
        x?: (boolean|null);

        /** Elastic y */
        y?: (boolean|null);

        /** Elastic z */
        z?: (boolean|null);

        /** Elastic container */
        container?: (boolean|null);

        /** Elastic position */
        position?: (pb.Elastic.Position|null);

        /** Elastic param */
        param?: (pb.Elastic.IParam[]|null);

        /** Elastic min */
        min?: (number[]|null);

        /** Elastic max */
        max?: (number[]|null);
    }

    /** Represents an Elastic. */
    class Elastic implements IElastic {

        /**
         * Constructs a new Elastic.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IElastic);

        /** Elastic size. */
        public size: number[];

        /** Elastic x. */
        public x: boolean;

        /** Elastic y. */
        public y: boolean;

        /** Elastic z. */
        public z: boolean;

        /** Elastic container. */
        public container: boolean;

        /** Elastic position. */
        public position: pb.Elastic.Position;

        /** Elastic param. */
        public param: pb.Elastic.IParam[];

        /** Elastic min. */
        public min: number[];

        /** Elastic max. */
        public max: number[];

        /**
         * Creates a new Elastic instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Elastic instance
         */
        public static create(properties?: pb.IElastic): pb.Elastic;

        /**
         * Encodes the specified Elastic message. Does not implicitly {@link pb.Elastic.verify|verify} messages.
         * @param message Elastic message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IElastic, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Elastic message, length delimited. Does not implicitly {@link pb.Elastic.verify|verify} messages.
         * @param message Elastic message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IElastic, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Elastic message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Elastic
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Elastic;

        /**
         * Decodes an Elastic message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Elastic
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Elastic;

        /**
         * Verifies an Elastic message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Elastic message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Elastic
         */
        public static fromObject(object: { [k: string]: any }): pb.Elastic;

        /**
         * Creates a plain object from an Elastic message. Also converts values to other types if specified.
         * @param message Elastic
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Elastic, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Elastic to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Elastic {

        /** Position enum. */
        enum Position {
            None = 0,
            Fill = 1,
            Left = 2,
            Right = 3,
            Bottom = 4,
            Top = 5,
            Back = 6,
            Front = 7,
            Vertical = 8,
            Horizontal = 9,
            Frontal = 10,
            VSplitter = 11,
            HSplitter = 12,
            FSplitter = 13,
            LeftRight = 14,
            TopBottom = 15,
        }

        /** ParamFlag enum. */
        enum ParamFlag {
            Default = 0,
            Symmetrical = 1,
            Radial = 2,
            Angular = 4,
            Numerical = 8,
            Before = 16,
            After = 32
        }

        /** Properties of a Param. */
        interface IParam {

            /** Param name */
            name?: (string|null);

            /** Param size */
            size?: (number|null);

            /** Param flags */
            flags?: (number|null);

            /** Param description */
            description?: (string|null);

            /** Param variants */
            variants?: (string|null);
        }

        /** Represents a Param. */
        class Param implements IParam {

            /**
             * Constructs a new Param.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Elastic.IParam);

            /** Param name. */
            public name: string;

            /** Param size. */
            public size: number;

            /** Param flags. */
            public flags: number;

            /** Param description. */
            public description: string;

            /** Param variants. */
            public variants: string;

            /**
             * Creates a new Param instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Param instance
             */
            public static create(properties?: pb.Elastic.IParam): pb.Elastic.Param;

            /**
             * Encodes the specified Param message. Does not implicitly {@link pb.Elastic.Param.verify|verify} messages.
             * @param message Param message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Elastic.IParam, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Param message, length delimited. Does not implicitly {@link pb.Elastic.Param.verify|verify} messages.
             * @param message Param message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Elastic.IParam, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Param message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Param
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Elastic.Param;

            /**
             * Decodes a Param message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Param
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Elastic.Param;

            /**
             * Verifies a Param message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Param message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Param
             */
            public static fromObject(object: { [k: string]: any }): pb.Elastic.Param;

            /**
             * Creates a plain object from a Param message. Also converts values to other types if specified.
             * @param message Param
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Elastic.Param, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Param to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a Content. */
    interface IContent {

        /** Content hasCommon */
        hasCommon?: (boolean|null);

        /** Content common */
        common?: (pb.ICommon|null);

        /** Content hasTransform */
        hasTransform?: (boolean|null);

        /** Content transform */
        transform?: (pb.ITransform|null);

        /** Content hasGeometry */
        hasGeometry?: (boolean|null);

        /** Content geometry */
        geometry?: (pb.IGeometry|null);

        /** Content hasEdges */
        hasEdges?: (boolean|null);

        /** Content edges */
        edges?: (pb.IEdges|null);

        /** Content hasData */
        hasData?: (boolean|null);

        /** Content data */
        data?: (string|null);

        /** Content dataUidMask */
        dataUidMask?: (number|Long|null);

        /** Content hasAnim */
        hasAnim?: (boolean|null);

        /** Content anim */
        anim?: (pb.ICompoundAnimation|null);

        /** Content hasElastic */
        hasElastic?: (boolean|null);

        /** Content elastic */
        elastic?: (pb.IElastic|null);
    }

    /** Represents a Content. */
    class Content implements IContent {

        /**
         * Constructs a new Content.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IContent);

        /** Content hasCommon. */
        public hasCommon: boolean;

        /** Content common. */
        public common?: (pb.ICommon|null);

        /** Content hasTransform. */
        public hasTransform: boolean;

        /** Content transform. */
        public transform?: (pb.ITransform|null);

        /** Content hasGeometry. */
        public hasGeometry: boolean;

        /** Content geometry. */
        public geometry?: (pb.IGeometry|null);

        /** Content hasEdges. */
        public hasEdges: boolean;

        /** Content edges. */
        public edges?: (pb.IEdges|null);

        /** Content hasData. */
        public hasData: boolean;

        /** Content data. */
        public data: string;

        /** Content dataUidMask. */
        public dataUidMask: (number|Long);

        /** Content hasAnim. */
        public hasAnim: boolean;

        /** Content anim. */
        public anim?: (pb.ICompoundAnimation|null);

        /** Content hasElastic. */
        public hasElastic: boolean;

        /** Content elastic. */
        public elastic?: (pb.IElastic|null);

        /**
         * Creates a new Content instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Content instance
         */
        public static create(properties?: pb.IContent): pb.Content;

        /**
         * Encodes the specified Content message. Does not implicitly {@link pb.Content.verify|verify} messages.
         * @param message Content message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IContent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Content message, length delimited. Does not implicitly {@link pb.Content.verify|verify} messages.
         * @param message Content message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IContent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Content message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Content
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Content;

        /**
         * Decodes a Content message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Content
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Content;

        /**
         * Verifies a Content message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Content message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Content
         */
        public static fromObject(object: { [k: string]: any }): pb.Content;

        /**
         * Creates a plain object from a Content message. Also converts values to other types if specified.
         * @param message Content
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Content, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Content to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an Entity. */
    interface IEntity {

        /** Entity uid */
        uid?: (number|Long|null);

        /** Entity content */
        content?: (pb.IContent|null);

        /** Entity syncChildren */
        syncChildren?: (boolean|null);

        /** Entity child */
        child?: ((number|Long)[]|null);
    }

    /** Represents an Entity. */
    class Entity implements IEntity {

        /**
         * Constructs a new Entity.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IEntity);

        /** Entity uid. */
        public uid: (number|Long);

        /** Entity content. */
        public content?: (pb.IContent|null);

        /** Entity syncChildren. */
        public syncChildren: boolean;

        /** Entity child. */
        public child: (number|Long)[];

        /**
         * Creates a new Entity instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Entity instance
         */
        public static create(properties?: pb.IEntity): pb.Entity;

        /**
         * Encodes the specified Entity message. Does not implicitly {@link pb.Entity.verify|verify} messages.
         * @param message Entity message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IEntity, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Entity message, length delimited. Does not implicitly {@link pb.Entity.verify|verify} messages.
         * @param message Entity message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IEntity, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Entity message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Entity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Entity;

        /**
         * Decodes an Entity message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Entity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Entity;

        /**
         * Verifies an Entity message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Entity message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Entity
         */
        public static fromObject(object: { [k: string]: any }): pb.Entity;

        /**
         * Creates a plain object from an Entity message. Also converts values to other types if specified.
         * @param message Entity
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Entity, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Entity to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Scene. */
    interface IScene {

        /** Scene rootUid */
        rootUid?: (number|Long|null);

        /** Scene entity */
        entity?: (pb.IEntity[]|null);

        /** Scene revision */
        revision?: (number|Long|null);

        /** Scene undo */
        undo?: (string|null);

        /** Scene redo */
        redo?: (string|null);

        /** Scene operation */
        operation?: (number|Long|null);

        /** Scene camera */
        camera?: (string|null);
    }

    /** Represents a Scene. */
    class Scene implements IScene {

        /**
         * Constructs a new Scene.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IScene);

        /** Scene rootUid. */
        public rootUid: (number|Long);

        /** Scene entity. */
        public entity: pb.IEntity[];

        /** Scene revision. */
        public revision: (number|Long);

        /** Scene undo. */
        public undo: string;

        /** Scene redo. */
        public redo: string;

        /** Scene operation. */
        public operation: (number|Long);

        /** Scene camera. */
        public camera: string;

        /**
         * Creates a new Scene instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Scene instance
         */
        public static create(properties?: pb.IScene): pb.Scene;

        /**
         * Encodes the specified Scene message. Does not implicitly {@link pb.Scene.verify|verify} messages.
         * @param message Scene message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IScene, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Scene message, length delimited. Does not implicitly {@link pb.Scene.verify|verify} messages.
         * @param message Scene message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IScene, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Scene message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Scene
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Scene;

        /**
         * Decodes a Scene message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Scene
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Scene;

        /**
         * Verifies a Scene message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Scene message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Scene
         */
        public static fromObject(object: { [k: string]: any }): pb.Scene;

        /**
         * Creates a plain object from a Scene message. Also converts values to other types if specified.
         * @param message Scene
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Scene, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Scene to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a PBTest. */
    interface IPBTest {

        /** PBTest count */
        count?: (number|null);

        /** PBTest text */
        text?: (string|null);
    }

    /** Represents a PBTest. */
    class PBTest implements IPBTest {

        /**
         * Constructs a new PBTest.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IPBTest);

        /** PBTest count. */
        public count: number;

        /** PBTest text. */
        public text: string;

        /**
         * Creates a new PBTest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PBTest instance
         */
        public static create(properties?: pb.IPBTest): pb.PBTest;

        /**
         * Encodes the specified PBTest message. Does not implicitly {@link pb.PBTest.verify|verify} messages.
         * @param message PBTest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IPBTest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PBTest message, length delimited. Does not implicitly {@link pb.PBTest.verify|verify} messages.
         * @param message PBTest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IPBTest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PBTest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PBTest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.PBTest;

        /**
         * Decodes a PBTest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PBTest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.PBTest;

        /**
         * Verifies a PBTest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PBTest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PBTest
         */
        public static fromObject(object: { [k: string]: any }): pb.PBTest;

        /**
         * Creates a plain object from a PBTest message. Also converts values to other types if specified.
         * @param message PBTest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.PBTest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PBTest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Material. */
    interface IMaterial {

        /** Material name */
        name?: (string|null);

        /** Material catalog */
        catalog?: (number|null);

        /** Material thickness */
        thickness?: (number|null);

        /** Material width */
        width?: (number|null);
    }

    /** Represents a Material. */
    class Material implements IMaterial {

        /**
         * Constructs a new Material.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IMaterial);

        /** Material name. */
        public name: string;

        /** Material catalog. */
        public catalog: number;

        /** Material thickness. */
        public thickness: number;

        /** Material width. */
        public width: number;

        /**
         * Creates a new Material instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Material instance
         */
        public static create(properties?: pb.IMaterial): pb.Material;

        /**
         * Encodes the specified Material message. Does not implicitly {@link pb.Material.verify|verify} messages.
         * @param message Material message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IMaterial, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Material message, length delimited. Does not implicitly {@link pb.Material.verify|verify} messages.
         * @param message Material message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IMaterial, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Material message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Material
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Material;

        /**
         * Decodes a Material message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Material
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Material;

        /**
         * Verifies a Material message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Material message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Material
         */
        public static fromObject(object: { [k: string]: any }): pb.Material;

        /**
         * Creates a plain object from a Material message. Also converts values to other types if specified.
         * @param message Material
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Material, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Material to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Vector3D. */
    interface IVector3D {

        /** Vector3D x */
        x?: (number|null);

        /** Vector3D y */
        y?: (number|null);

        /** Vector3D z */
        z?: (number|null);
    }

    /** Represents a Vector3D. */
    class Vector3D implements IVector3D {

        /**
         * Constructs a new Vector3D.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IVector3D);

        /** Vector3D x. */
        public x: number;

        /** Vector3D y. */
        public y: number;

        /** Vector3D z. */
        public z: number;

        /**
         * Creates a new Vector3D instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Vector3D instance
         */
        public static create(properties?: pb.IVector3D): pb.Vector3D;

        /**
         * Encodes the specified Vector3D message. Does not implicitly {@link pb.Vector3D.verify|verify} messages.
         * @param message Vector3D message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IVector3D, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Vector3D message, length delimited. Does not implicitly {@link pb.Vector3D.verify|verify} messages.
         * @param message Vector3D message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IVector3D, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Vector3D message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Vector3D
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Vector3D;

        /**
         * Decodes a Vector3D message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Vector3D
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Vector3D;

        /**
         * Verifies a Vector3D message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Vector3D message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Vector3D
         */
        public static fromObject(object: { [k: string]: any }): pb.Vector3D;

        /**
         * Creates a plain object from a Vector3D message. Also converts values to other types if specified.
         * @param message Vector3D
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Vector3D, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Vector3D to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an Element2D. */
    interface IElement2D {

        /** Element2D uid */
        uid?: (number|null);

        /** Element2D group */
        group?: (pb.Element2D.IGroup|null);

        /** Element2D point */
        point?: (pb.Element2D.IVector|null);

        /** Element2D segment */
        segment?: (pb.Element2D.ISegment|null);

        /** Element2D arc */
        arc?: (pb.Element2D.IArc|null);
    }

    /** Represents an Element2D. */
    class Element2D implements IElement2D {

        /**
         * Constructs a new Element2D.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IElement2D);

        /** Element2D uid. */
        public uid: number;

        /** Element2D group. */
        public group?: (pb.Element2D.IGroup|null);

        /** Element2D point. */
        public point?: (pb.Element2D.IVector|null);

        /** Element2D segment. */
        public segment?: (pb.Element2D.ISegment|null);

        /** Element2D arc. */
        public arc?: (pb.Element2D.IArc|null);

        /**
         * Creates a new Element2D instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Element2D instance
         */
        public static create(properties?: pb.IElement2D): pb.Element2D;

        /**
         * Encodes the specified Element2D message. Does not implicitly {@link pb.Element2D.verify|verify} messages.
         * @param message Element2D message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IElement2D, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Element2D message, length delimited. Does not implicitly {@link pb.Element2D.verify|verify} messages.
         * @param message Element2D message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IElement2D, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Element2D message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Element2D
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Element2D;

        /**
         * Decodes an Element2D message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Element2D
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Element2D;

        /**
         * Verifies an Element2D message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Element2D message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Element2D
         */
        public static fromObject(object: { [k: string]: any }): pb.Element2D;

        /**
         * Creates a plain object from an Element2D message. Also converts values to other types if specified.
         * @param message Element2D
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Element2D, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Element2D to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Element2D {

        /** Properties of a Vector. */
        interface IVector {

            /** Vector x */
            x?: (number|null);

            /** Vector y */
            y?: (number|null);
        }

        /** Represents a Vector. */
        class Vector implements IVector {

            /**
             * Constructs a new Vector.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Element2D.IVector);

            /** Vector x. */
            public x: number;

            /** Vector y. */
            public y: number;

            /**
             * Creates a new Vector instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Vector instance
             */
            public static create(properties?: pb.Element2D.IVector): pb.Element2D.Vector;

            /**
             * Encodes the specified Vector message. Does not implicitly {@link pb.Element2D.Vector.verify|verify} messages.
             * @param message Vector message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Element2D.IVector, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Vector message, length delimited. Does not implicitly {@link pb.Element2D.Vector.verify|verify} messages.
             * @param message Vector message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Element2D.IVector, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Vector message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Vector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Element2D.Vector;

            /**
             * Decodes a Vector message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Vector
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Element2D.Vector;

            /**
             * Verifies a Vector message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Vector message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Vector
             */
            public static fromObject(object: { [k: string]: any }): pb.Element2D.Vector;

            /**
             * Creates a plain object from a Vector message. Also converts values to other types if specified.
             * @param message Vector
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Element2D.Vector, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Vector to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Segment. */
        interface ISegment {

            /** Segment p1 */
            p1?: (pb.Element2D.IVector|null);

            /** Segment p2 */
            p2?: (pb.Element2D.IVector|null);
        }

        /** Represents a Segment. */
        class Segment implements ISegment {

            /**
             * Constructs a new Segment.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Element2D.ISegment);

            /** Segment p1. */
            public p1?: (pb.Element2D.IVector|null);

            /** Segment p2. */
            public p2?: (pb.Element2D.IVector|null);

            /**
             * Creates a new Segment instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Segment instance
             */
            public static create(properties?: pb.Element2D.ISegment): pb.Element2D.Segment;

            /**
             * Encodes the specified Segment message. Does not implicitly {@link pb.Element2D.Segment.verify|verify} messages.
             * @param message Segment message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Element2D.ISegment, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Segment message, length delimited. Does not implicitly {@link pb.Element2D.Segment.verify|verify} messages.
             * @param message Segment message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Element2D.ISegment, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Segment message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Segment
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Element2D.Segment;

            /**
             * Decodes a Segment message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Segment
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Element2D.Segment;

            /**
             * Verifies a Segment message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Segment message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Segment
             */
            public static fromObject(object: { [k: string]: any }): pb.Element2D.Segment;

            /**
             * Creates a plain object from a Segment message. Also converts values to other types if specified.
             * @param message Segment
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Element2D.Segment, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Segment to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an Arc. */
        interface IArc {

            /** Arc center */
            center?: (pb.Element2D.IVector|null);

            /** Arc axisx */
            axisx?: (pb.Element2D.IVector|null);

            /** Arc axisy */
            axisy?: (pb.Element2D.IVector|null);

            /** Arc angle1 */
            angle1?: (number|null);

            /** Arc angle2 */
            angle2?: (number|null);

            /** Arc radiusa */
            radiusa?: (number|null);

            /** Arc radiusb */
            radiusb?: (number|null);

            /** Arc sense */
            sense?: (boolean|null);
        }

        /** Represents an Arc. */
        class Arc implements IArc {

            /**
             * Constructs a new Arc.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Element2D.IArc);

            /** Arc center. */
            public center?: (pb.Element2D.IVector|null);

            /** Arc axisx. */
            public axisx?: (pb.Element2D.IVector|null);

            /** Arc axisy. */
            public axisy?: (pb.Element2D.IVector|null);

            /** Arc angle1. */
            public angle1: number;

            /** Arc angle2. */
            public angle2: number;

            /** Arc radiusa. */
            public radiusa: number;

            /** Arc radiusb. */
            public radiusb: number;

            /** Arc sense. */
            public sense: boolean;

            /**
             * Creates a new Arc instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Arc instance
             */
            public static create(properties?: pb.Element2D.IArc): pb.Element2D.Arc;

            /**
             * Encodes the specified Arc message. Does not implicitly {@link pb.Element2D.Arc.verify|verify} messages.
             * @param message Arc message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Element2D.IArc, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Arc message, length delimited. Does not implicitly {@link pb.Element2D.Arc.verify|verify} messages.
             * @param message Arc message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Element2D.IArc, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Arc message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Arc
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Element2D.Arc;

            /**
             * Decodes an Arc message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Arc
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Element2D.Arc;

            /**
             * Verifies an Arc message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Arc message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Arc
             */
            public static fromObject(object: { [k: string]: any }): pb.Element2D.Arc;

            /**
             * Creates a plain object from an Arc message. Also converts values to other types if specified.
             * @param message Arc
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Element2D.Arc, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Arc to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Group. */
        interface IGroup {

            /** Group item */
            item?: (pb.IElement2D[]|null);
        }

        /** Represents a Group. */
        class Group implements IGroup {

            /**
             * Constructs a new Group.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Element2D.IGroup);

            /** Group item. */
            public item: pb.IElement2D[];

            /**
             * Creates a new Group instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Group instance
             */
            public static create(properties?: pb.Element2D.IGroup): pb.Element2D.Group;

            /**
             * Encodes the specified Group message. Does not implicitly {@link pb.Element2D.Group.verify|verify} messages.
             * @param message Group message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Element2D.IGroup, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Group message, length delimited. Does not implicitly {@link pb.Element2D.Group.verify|verify} messages.
             * @param message Group message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Element2D.IGroup, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Group message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Group
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Element2D.Group;

            /**
             * Decodes a Group message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Group
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Element2D.Group;

            /**
             * Verifies a Group message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Group message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Group
             */
            public static fromObject(object: { [k: string]: any }): pb.Element2D.Group;

            /**
             * Creates a plain object from a Group message. Also converts values to other types if specified.
             * @param message Group
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Element2D.Group, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Group to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a BuilderOperationList. */
    interface IBuilderOperationList {

        /** BuilderOperationList operation */
        operation?: (pb.IOperation[]|null);
    }

    /** Represents a BuilderOperationList. */
    class BuilderOperationList implements IBuilderOperationList {

        /**
         * Constructs a new BuilderOperationList.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IBuilderOperationList);

        /** BuilderOperationList operation. */
        public operation: pb.IOperation[];

        /**
         * Creates a new BuilderOperationList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BuilderOperationList instance
         */
        public static create(properties?: pb.IBuilderOperationList): pb.BuilderOperationList;

        /**
         * Encodes the specified BuilderOperationList message. Does not implicitly {@link pb.BuilderOperationList.verify|verify} messages.
         * @param message BuilderOperationList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IBuilderOperationList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BuilderOperationList message, length delimited. Does not implicitly {@link pb.BuilderOperationList.verify|verify} messages.
         * @param message BuilderOperationList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IBuilderOperationList, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BuilderOperationList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns BuilderOperationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.BuilderOperationList;

        /**
         * Decodes a BuilderOperationList message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns BuilderOperationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.BuilderOperationList;

        /**
         * Verifies a BuilderOperationList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BuilderOperationList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BuilderOperationList
         */
        public static fromObject(object: { [k: string]: any }): pb.BuilderOperationList;

        /**
         * Creates a plain object from a BuilderOperationList message. Also converts values to other types if specified.
         * @param message BuilderOperationList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.BuilderOperationList, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BuilderOperationList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Builder. */
    interface IBuilder {

        /** Builder material */
        material?: (pb.IMaterial|null);

        /** Builder operations */
        operations?: (pb.IBuilderOperationList|null);

        /** Builder panel */
        panel?: (pb.Builder.IPanel|null);

        /** Builder profile */
        profile?: (pb.Builder.IProfile|null);

        /** Builder rotation */
        rotation?: (pb.Builder.IRotation|null);

        /** Builder solid */
        solid?: (pb.Builder.ISolid|null);
    }

    /** Represents a Builder. */
    class Builder implements IBuilder {

        /**
         * Constructs a new Builder.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IBuilder);

        /** Builder material. */
        public material?: (pb.IMaterial|null);

        /** Builder operations. */
        public operations?: (pb.IBuilderOperationList|null);

        /** Builder panel. */
        public panel?: (pb.Builder.IPanel|null);

        /** Builder profile. */
        public profile?: (pb.Builder.IProfile|null);

        /** Builder rotation. */
        public rotation?: (pb.Builder.IRotation|null);

        /** Builder solid. */
        public solid?: (pb.Builder.ISolid|null);

        /**
         * Creates a new Builder instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Builder instance
         */
        public static create(properties?: pb.IBuilder): pb.Builder;

        /**
         * Encodes the specified Builder message. Does not implicitly {@link pb.Builder.verify|verify} messages.
         * @param message Builder message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IBuilder, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Builder message, length delimited. Does not implicitly {@link pb.Builder.verify|verify} messages.
         * @param message Builder message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IBuilder, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Builder message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Builder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Builder;

        /**
         * Decodes a Builder message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Builder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Builder;

        /**
         * Verifies a Builder message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Builder message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Builder
         */
        public static fromObject(object: { [k: string]: any }): pb.Builder;

        /**
         * Creates a plain object from a Builder message. Also converts values to other types if specified.
         * @param message Builder
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Builder, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Builder to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Builder {

        /** Properties of a Panel. */
        interface IPanel {

            /** Panel contour */
            contour?: (pb.IElement2D|null);

            /** Panel edge */
            edge?: (pb.Builder.Panel.IEdge[]|null);

            /** Panel plastic */
            plastic?: (pb.Builder.Panel.IPlastic[]|null);

            /** Panel bentPath */
            bentPath?: (pb.IElement2D|null);

            /** Panel bentDirection */
            bentDirection?: (boolean|null);

            /** Panel interlayerThickness */
            interlayerThickness?: (number|null);

            /** Panel texture */
            texture?: (pb.Builder.Panel.Texture|null);
        }

        /** Represents a Panel. */
        class Panel implements IPanel {

            /**
             * Constructs a new Panel.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Builder.IPanel);

            /** Panel contour. */
            public contour?: (pb.IElement2D|null);

            /** Panel edge. */
            public edge: pb.Builder.Panel.IEdge[];

            /** Panel plastic. */
            public plastic: pb.Builder.Panel.IPlastic[];

            /** Panel bentPath. */
            public bentPath?: (pb.IElement2D|null);

            /** Panel bentDirection. */
            public bentDirection: boolean;

            /** Panel interlayerThickness. */
            public interlayerThickness: number;

            /** Panel texture. */
            public texture: pb.Builder.Panel.Texture;

            /**
             * Creates a new Panel instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Panel instance
             */
            public static create(properties?: pb.Builder.IPanel): pb.Builder.Panel;

            /**
             * Encodes the specified Panel message. Does not implicitly {@link pb.Builder.Panel.verify|verify} messages.
             * @param message Panel message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Builder.IPanel, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Panel message, length delimited. Does not implicitly {@link pb.Builder.Panel.verify|verify} messages.
             * @param message Panel message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Builder.IPanel, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Panel message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Panel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Builder.Panel;

            /**
             * Decodes a Panel message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Panel
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Builder.Panel;

            /**
             * Verifies a Panel message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Panel message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Panel
             */
            public static fromObject(object: { [k: string]: any }): pb.Builder.Panel;

            /**
             * Creates a plain object from a Panel message. Also converts values to other types if specified.
             * @param message Panel
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Builder.Panel, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Panel to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Panel {

            /** Side enum. */
            enum Side {
                None = 0,
                Front = 1,
                Back = 2
            }

            /** Texture enum. */
            enum Texture {
                Default = 0,
                Horizontal = 1,
                Vertical = 2
            }

            /** Properties of an Edge. */
            interface IEdge {

                /** Edge material */
                material?: (pb.IMaterial|null);

                /** Edge crop */
                crop?: (boolean|null);

                /** Edge elemId */
                elemId?: (number|null);

                /** Edge cutIndex */
                cutIndex?: (number|null);

                /** Edge allowance */
                allowance?: (number|null);
            }

            /** Represents an Edge. */
            class Edge implements IEdge {

                /**
                 * Constructs a new Edge.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: pb.Builder.Panel.IEdge);

                /** Edge material. */
                public material?: (pb.IMaterial|null);

                /** Edge crop. */
                public crop: boolean;

                /** Edge elemId. */
                public elemId: number;

                /** Edge cutIndex. */
                public cutIndex: number;

                /** Edge allowance. */
                public allowance: number;

                /**
                 * Creates a new Edge instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Edge instance
                 */
                public static create(properties?: pb.Builder.Panel.IEdge): pb.Builder.Panel.Edge;

                /**
                 * Encodes the specified Edge message. Does not implicitly {@link pb.Builder.Panel.Edge.verify|verify} messages.
                 * @param message Edge message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: pb.Builder.Panel.IEdge, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Edge message, length delimited. Does not implicitly {@link pb.Builder.Panel.Edge.verify|verify} messages.
                 * @param message Edge message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: pb.Builder.Panel.IEdge, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Edge message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Edge
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Builder.Panel.Edge;

                /**
                 * Decodes an Edge message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Edge
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Builder.Panel.Edge;

                /**
                 * Verifies an Edge message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an Edge message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Edge
                 */
                public static fromObject(object: { [k: string]: any }): pb.Builder.Panel.Edge;

                /**
                 * Creates a plain object from an Edge message. Also converts values to other types if specified.
                 * @param message Edge
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: pb.Builder.Panel.Edge, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Edge to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a Plastic. */
            interface IPlastic {

                /** Plastic material */
                material?: (pb.IMaterial|null);

                /** Plastic side */
                side?: (pb.Builder.Panel.Side|null);

                /** Plastic contour */
                contour?: (pb.IElement2D|null);

                /** Plastic texture */
                texture?: (pb.Builder.Panel.Texture|null);
            }

            /** Represents a Plastic. */
            class Plastic implements IPlastic {

                /**
                 * Constructs a new Plastic.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: pb.Builder.Panel.IPlastic);

                /** Plastic material. */
                public material?: (pb.IMaterial|null);

                /** Plastic side. */
                public side: pb.Builder.Panel.Side;

                /** Plastic contour. */
                public contour?: (pb.IElement2D|null);

                /** Plastic texture. */
                public texture: pb.Builder.Panel.Texture;

                /**
                 * Creates a new Plastic instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Plastic instance
                 */
                public static create(properties?: pb.Builder.Panel.IPlastic): pb.Builder.Panel.Plastic;

                /**
                 * Encodes the specified Plastic message. Does not implicitly {@link pb.Builder.Panel.Plastic.verify|verify} messages.
                 * @param message Plastic message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: pb.Builder.Panel.IPlastic, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Plastic message, length delimited. Does not implicitly {@link pb.Builder.Panel.Plastic.verify|verify} messages.
                 * @param message Plastic message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: pb.Builder.Panel.IPlastic, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Plastic message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Plastic
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Builder.Panel.Plastic;

                /**
                 * Decodes a Plastic message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Plastic
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Builder.Panel.Plastic;

                /**
                 * Verifies a Plastic message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Plastic message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Plastic
                 */
                public static fromObject(object: { [k: string]: any }): pb.Builder.Panel.Plastic;

                /**
                 * Creates a plain object from a Plastic message. Also converts values to other types if specified.
                 * @param message Plastic
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: pb.Builder.Panel.Plastic, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Plastic to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of a Profile. */
        interface IProfile {

            /** Profile path */
            path?: (pb.IElement2D|null);

            /** Profile profile */
            profile?: (pb.IElement2D|null);
        }

        /** Represents a Profile. */
        class Profile implements IProfile {

            /**
             * Constructs a new Profile.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Builder.IProfile);

            /** Profile path. */
            public path?: (pb.IElement2D|null);

            /** Profile profile. */
            public profile?: (pb.IElement2D|null);

            /**
             * Creates a new Profile instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Profile instance
             */
            public static create(properties?: pb.Builder.IProfile): pb.Builder.Profile;

            /**
             * Encodes the specified Profile message. Does not implicitly {@link pb.Builder.Profile.verify|verify} messages.
             * @param message Profile message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Builder.IProfile, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Profile message, length delimited. Does not implicitly {@link pb.Builder.Profile.verify|verify} messages.
             * @param message Profile message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Builder.IProfile, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Profile message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Profile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Builder.Profile;

            /**
             * Decodes a Profile message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Profile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Builder.Profile;

            /**
             * Verifies a Profile message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Profile message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Profile
             */
            public static fromObject(object: { [k: string]: any }): pb.Builder.Profile;

            /**
             * Creates a plain object from a Profile message. Also converts values to other types if specified.
             * @param message Profile
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Builder.Profile, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Profile to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Rotation. */
        interface IRotation {

            /** Rotation profile */
            profile?: (pb.IElement2D|null);
        }

        /** Represents a Rotation. */
        class Rotation implements IRotation {

            /**
             * Constructs a new Rotation.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Builder.IRotation);

            /** Rotation profile. */
            public profile?: (pb.IElement2D|null);

            /**
             * Creates a new Rotation instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Rotation instance
             */
            public static create(properties?: pb.Builder.IRotation): pb.Builder.Rotation;

            /**
             * Encodes the specified Rotation message. Does not implicitly {@link pb.Builder.Rotation.verify|verify} messages.
             * @param message Rotation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Builder.IRotation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Rotation message, length delimited. Does not implicitly {@link pb.Builder.Rotation.verify|verify} messages.
             * @param message Rotation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Builder.IRotation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Rotation message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Rotation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Builder.Rotation;

            /**
             * Decodes a Rotation message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Rotation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Builder.Rotation;

            /**
             * Verifies a Rotation message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Rotation message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Rotation
             */
            public static fromObject(object: { [k: string]: any }): pb.Builder.Rotation;

            /**
             * Creates a plain object from a Rotation message. Also converts values to other types if specified.
             * @param message Rotation
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Builder.Rotation, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Rotation to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Solid. */
        interface ISolid {

            /** Solid mbSolid */
            mbSolid?: (Uint8Array|null);
        }

        /** Represents a Solid. */
        class Solid implements ISolid {

            /**
             * Constructs a new Solid.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Builder.ISolid);

            /** Solid mbSolid. */
            public mbSolid: Uint8Array;

            /**
             * Creates a new Solid instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Solid instance
             */
            public static create(properties?: pb.Builder.ISolid): pb.Builder.Solid;

            /**
             * Encodes the specified Solid message. Does not implicitly {@link pb.Builder.Solid.verify|verify} messages.
             * @param message Solid message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Builder.ISolid, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Solid message, length delimited. Does not implicitly {@link pb.Builder.Solid.verify|verify} messages.
             * @param message Solid message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Builder.ISolid, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Solid message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Solid
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Builder.Solid;

            /**
             * Decodes a Solid message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Solid
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Builder.Solid;

            /**
             * Verifies a Solid message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Solid message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Solid
             */
            public static fromObject(object: { [k: string]: any }): pb.Builder.Solid;

            /**
             * Creates a plain object from a Solid message. Also converts values to other types if specified.
             * @param message Solid
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Builder.Solid, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Solid to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of an Operation. */
    interface IOperation {

        /** Operation link */
        link?: (number|Long|null);

        /** Operation linkRevision */
        linkRevision?: (number|Long|null);

        /** Operation name */
        name?: (string|null);

        /** Operation cut */
        cut?: (pb.Operation.ICut|null);

        /** Operation externalCut */
        externalCut?: (pb.Operation.IExternalCut|null);

        /** Operation clip */
        clip?: (pb.Operation.IClip|null);

        /** Operation painting */
        painting?: (pb.Operation.IPainting|null);

        /** Operation hole */
        hole?: (pb.Operation.IHole|null);
    }

    /** Represents an Operation. */
    class Operation implements IOperation {

        /**
         * Constructs a new Operation.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IOperation);

        /** Operation link. */
        public link: (number|Long);

        /** Operation linkRevision. */
        public linkRevision: (number|Long);

        /** Operation name. */
        public name: string;

        /** Operation cut. */
        public cut?: (pb.Operation.ICut|null);

        /** Operation externalCut. */
        public externalCut?: (pb.Operation.IExternalCut|null);

        /** Operation clip. */
        public clip?: (pb.Operation.IClip|null);

        /** Operation painting. */
        public painting?: (pb.Operation.IPainting|null);

        /** Operation hole. */
        public hole?: (pb.Operation.IHole|null);

        /**
         * Creates a new Operation instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Operation instance
         */
        public static create(properties?: pb.IOperation): pb.Operation;

        /**
         * Encodes the specified Operation message. Does not implicitly {@link pb.Operation.verify|verify} messages.
         * @param message Operation message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IOperation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Operation message, length delimited. Does not implicitly {@link pb.Operation.verify|verify} messages.
         * @param message Operation message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IOperation, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Operation message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Operation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Operation;

        /**
         * Decodes an Operation message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Operation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Operation;

        /**
         * Verifies an Operation message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Operation message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Operation
         */
        public static fromObject(object: { [k: string]: any }): pb.Operation;

        /**
         * Creates a plain object from an Operation message. Also converts values to other types if specified.
         * @param message Operation
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.Operation, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Operation to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Operation {

        /** Properties of a Cut. */
        interface ICut {

            /** Cut body */
            body?: (pb.IBuilder|null);

            /** Cut matrix */
            matrix?: (number[]|null);

            /** Cut bent */
            bent?: (boolean|null);

            /** Cut mode */
            mode?: (pb.Operation.Cut.Mode|null);
        }

        /** Represents a Cut. */
        class Cut implements ICut {

            /**
             * Constructs a new Cut.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Operation.ICut);

            /** Cut body. */
            public body?: (pb.IBuilder|null);

            /** Cut matrix. */
            public matrix: number[];

            /** Cut bent. */
            public bent: boolean;

            /** Cut mode. */
            public mode: pb.Operation.Cut.Mode;

            /**
             * Creates a new Cut instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Cut instance
             */
            public static create(properties?: pb.Operation.ICut): pb.Operation.Cut;

            /**
             * Encodes the specified Cut message. Does not implicitly {@link pb.Operation.Cut.verify|verify} messages.
             * @param message Cut message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Operation.ICut, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Cut message, length delimited. Does not implicitly {@link pb.Operation.Cut.verify|verify} messages.
             * @param message Cut message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Operation.ICut, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Cut message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Cut
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Operation.Cut;

            /**
             * Decodes a Cut message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Cut
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Operation.Cut;

            /**
             * Verifies a Cut message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Cut message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Cut
             */
            public static fromObject(object: { [k: string]: any }): pb.Operation.Cut;

            /**
             * Creates a plain object from a Cut message. Also converts values to other types if specified.
             * @param message Cut
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Operation.Cut, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Cut to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Cut {

            /** Mode enum. */
            enum Mode {
                Subtract = 0,
                Add = 1,
                Intersect = 2
            }
        }

        /** Properties of an ExternalCut. */
        interface IExternalCut {

            /** ExternalCut enabled */
            enabled?: (boolean|null);
        }

        /** Represents an ExternalCut. */
        class ExternalCut implements IExternalCut {

            /**
             * Constructs a new ExternalCut.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Operation.IExternalCut);

            /** ExternalCut enabled. */
            public enabled: boolean;

            /**
             * Creates a new ExternalCut instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ExternalCut instance
             */
            public static create(properties?: pb.Operation.IExternalCut): pb.Operation.ExternalCut;

            /**
             * Encodes the specified ExternalCut message. Does not implicitly {@link pb.Operation.ExternalCut.verify|verify} messages.
             * @param message ExternalCut message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Operation.IExternalCut, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ExternalCut message, length delimited. Does not implicitly {@link pb.Operation.ExternalCut.verify|verify} messages.
             * @param message ExternalCut message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Operation.IExternalCut, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ExternalCut message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ExternalCut
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Operation.ExternalCut;

            /**
             * Decodes an ExternalCut message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ExternalCut
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Operation.ExternalCut;

            /**
             * Verifies an ExternalCut message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ExternalCut message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ExternalCut
             */
            public static fromObject(object: { [k: string]: any }): pb.Operation.ExternalCut;

            /**
             * Creates a plain object from an ExternalCut message. Also converts values to other types if specified.
             * @param message ExternalCut
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Operation.ExternalCut, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ExternalCut to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Clip. */
        interface IClip {

            /** Clip pos */
            pos?: (pb.IVector3D|null);

            /** Clip normal */
            normal?: (pb.IVector3D|null);
        }

        /** Represents a Clip. */
        class Clip implements IClip {

            /**
             * Constructs a new Clip.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Operation.IClip);

            /** Clip pos. */
            public pos?: (pb.IVector3D|null);

            /** Clip normal. */
            public normal?: (pb.IVector3D|null);

            /**
             * Creates a new Clip instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Clip instance
             */
            public static create(properties?: pb.Operation.IClip): pb.Operation.Clip;

            /**
             * Encodes the specified Clip message. Does not implicitly {@link pb.Operation.Clip.verify|verify} messages.
             * @param message Clip message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Operation.IClip, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Clip message, length delimited. Does not implicitly {@link pb.Operation.Clip.verify|verify} messages.
             * @param message Clip message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Operation.IClip, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Clip message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Clip
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Operation.Clip;

            /**
             * Decodes a Clip message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Clip
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Operation.Clip;

            /**
             * Verifies a Clip message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Clip message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Clip
             */
            public static fromObject(object: { [k: string]: any }): pb.Operation.Clip;

            /**
             * Creates a plain object from a Clip message. Also converts values to other types if specified.
             * @param message Clip
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Operation.Clip, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Clip to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Painting. */
        interface IPainting {

            /** Painting material */
            material?: (pb.IMaterial|null);

            /** Painting face */
            face?: (number[]|null);
        }

        /** Represents a Painting. */
        class Painting implements IPainting {

            /**
             * Constructs a new Painting.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Operation.IPainting);

            /** Painting material. */
            public material?: (pb.IMaterial|null);

            /** Painting face. */
            public face: number[];

            /**
             * Creates a new Painting instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Painting instance
             */
            public static create(properties?: pb.Operation.IPainting): pb.Operation.Painting;

            /**
             * Encodes the specified Painting message. Does not implicitly {@link pb.Operation.Painting.verify|verify} messages.
             * @param message Painting message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Operation.IPainting, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Painting message, length delimited. Does not implicitly {@link pb.Operation.Painting.verify|verify} messages.
             * @param message Painting message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Operation.IPainting, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Painting message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Painting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Operation.Painting;

            /**
             * Decodes a Painting message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Painting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Operation.Painting;

            /**
             * Verifies a Painting message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Painting message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Painting
             */
            public static fromObject(object: { [k: string]: any }): pb.Operation.Painting;

            /**
             * Creates a plain object from a Painting message. Also converts values to other types if specified.
             * @param message Painting
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Operation.Painting, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Painting to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Hole. */
        interface IHole {

            /** Hole pos */
            pos?: (pb.IVector3D|null);

            /** Hole dir */
            dir?: (pb.IVector3D|null);

            /** Hole depth */
            depth?: (number|null);

            /** Hole radius */
            radius?: (number|null);

            /** Hole mode */
            mode?: (pb.Operation.Hole.Mode|null);
        }

        /** Represents a Hole. */
        class Hole implements IHole {

            /**
             * Constructs a new Hole.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.Operation.IHole);

            /** Hole pos. */
            public pos?: (pb.IVector3D|null);

            /** Hole dir. */
            public dir?: (pb.IVector3D|null);

            /** Hole depth. */
            public depth: number;

            /** Hole radius. */
            public radius: number;

            /** Hole mode. */
            public mode: pb.Operation.Hole.Mode;

            /**
             * Creates a new Hole instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Hole instance
             */
            public static create(properties?: pb.Operation.IHole): pb.Operation.Hole;

            /**
             * Encodes the specified Hole message. Does not implicitly {@link pb.Operation.Hole.verify|verify} messages.
             * @param message Hole message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.Operation.IHole, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Hole message, length delimited. Does not implicitly {@link pb.Operation.Hole.verify|verify} messages.
             * @param message Hole message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.Operation.IHole, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Hole message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Hole
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.Operation.Hole;

            /**
             * Decodes a Hole message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Hole
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.Operation.Hole;

            /**
             * Verifies a Hole message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Hole message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Hole
             */
            public static fromObject(object: { [k: string]: any }): pb.Operation.Hole;

            /**
             * Creates a plain object from a Hole message. Also converts values to other types if specified.
             * @param message Hole
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.Operation.Hole, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Hole to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Hole {

            /** Mode enum. */
            enum Mode {
                Auto = 0,
                Through = 1,
                Blind = 2
            }
        }
    }

    /** Properties of a BuilderComponent. */
    interface IBuilderComponent {

        /** BuilderComponent builder */
        builder?: (pb.IBuilder|null);

        /** BuilderComponent level */
        level?: (number|null);
    }

    /** Represents a BuilderComponent. */
    class BuilderComponent implements IBuilderComponent {

        /**
         * Constructs a new BuilderComponent.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IBuilderComponent);

        /** BuilderComponent builder. */
        public builder?: (pb.IBuilder|null);

        /** BuilderComponent level */
        public level?: (number|null);

        /**
         * Creates a new BuilderComponent instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BuilderComponent instance
         */
        public static create(properties?: pb.IBuilderComponent): pb.BuilderComponent;

        /**
         * Encodes the specified BuilderComponent message. Does not implicitly {@link pb.BuilderComponent.verify|verify} messages.
         * @param message BuilderComponent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IBuilderComponent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BuilderComponent message, length delimited. Does not implicitly {@link pb.BuilderComponent.verify|verify} messages.
         * @param message BuilderComponent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IBuilderComponent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BuilderComponent message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns BuilderComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.BuilderComponent;

        /**
         * Decodes a BuilderComponent message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns BuilderComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.BuilderComponent;

        /**
         * Verifies a BuilderComponent message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BuilderComponent message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BuilderComponent
         */
        public static fromObject(object: { [k: string]: any }): pb.BuilderComponent;

        /**
         * Creates a plain object from a BuilderComponent message. Also converts values to other types if specified.
         * @param message BuilderComponent
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.BuilderComponent, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BuilderComponent to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a FurnitureComponent. */
    interface IFurnitureComponent {

        /** FurnitureComponent reference */
        reference?: (pb.FurnitureComponent.ReferenceMode|null);

        /** FurnitureComponent operations */
        operations?: (pb.IBuilderOperationList|null);

        /** FurnitureComponent box */
        box?: (number[]|null);

        /** FurnitureComponent symmetrizable */
        symmetrizable?: (boolean|null);

        /** FurnitureComponent symmetrized */
        symmetrized?: (boolean|null);
    }

    /** Represents a FurnitureComponent. */
    class FurnitureComponent implements IFurnitureComponent {

        /**
         * Constructs a new FurnitureComponent.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IFurnitureComponent);

        /** FurnitureComponent reference. */
        public reference: pb.FurnitureComponent.ReferenceMode;

        /** FurnitureComponent operations. */
        public operations?: (pb.IBuilderOperationList|null);

        /** FurnitureComponent box. */
        public box: number[];

        /** FurnitureComponent symmetrizable. */
        public symmetrizable: boolean;

        /** FurnitureComponent symmetrized. */
        public symmetrized: boolean;

        /**
         * Creates a new FurnitureComponent instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FurnitureComponent instance
         */
        public static create(properties?: pb.IFurnitureComponent): pb.FurnitureComponent;

        /**
         * Encodes the specified FurnitureComponent message. Does not implicitly {@link pb.FurnitureComponent.verify|verify} messages.
         * @param message FurnitureComponent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IFurnitureComponent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FurnitureComponent message, length delimited. Does not implicitly {@link pb.FurnitureComponent.verify|verify} messages.
         * @param message FurnitureComponent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IFurnitureComponent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FurnitureComponent message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FurnitureComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.FurnitureComponent;

        /**
         * Decodes a FurnitureComponent message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FurnitureComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.FurnitureComponent;

        /**
         * Verifies a FurnitureComponent message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FurnitureComponent message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FurnitureComponent
         */
        public static fromObject(object: { [k: string]: any }): pb.FurnitureComponent;

        /**
         * Creates a plain object from a FurnitureComponent message. Also converts values to other types if specified.
         * @param message FurnitureComponent
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.FurnitureComponent, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FurnitureComponent to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace FurnitureComponent {

        /** ReferenceMode enum. */
        enum ReferenceMode {
            Plane = 0,
            PlanePlane = 1,
            PlaneSide = 2,
            Box = 3,
            Joint = 4,
            None = -1
        }
    }

    /** Properties of a BuilderLinkComponent. */
    interface IBuilderLinkComponent {

        /** BuilderLinkComponent link */
        link?: (pb.BuilderLinkComponent.ILink[]|null);

        /** BuilderLinkComponent cutLink */
        cutLink?: (number|Long|null);
    }

    /** Represents a BuilderLinkComponent. */
    class BuilderLinkComponent implements IBuilderLinkComponent {

        /**
         * Constructs a new BuilderLinkComponent.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IBuilderLinkComponent);

        /** BuilderLinkComponent link. */
        public link: pb.BuilderLinkComponent.ILink[];

        /** BuilderLinkComponent cutLink. */
        public cutLink: (number|Long);

        /**
         * Creates a new BuilderLinkComponent instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BuilderLinkComponent instance
         */
        public static create(properties?: pb.IBuilderLinkComponent): pb.BuilderLinkComponent;

        /**
         * Encodes the specified BuilderLinkComponent message. Does not implicitly {@link pb.BuilderLinkComponent.verify|verify} messages.
         * @param message BuilderLinkComponent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IBuilderLinkComponent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BuilderLinkComponent message, length delimited. Does not implicitly {@link pb.BuilderLinkComponent.verify|verify} messages.
         * @param message BuilderLinkComponent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IBuilderLinkComponent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BuilderLinkComponent message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns BuilderLinkComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.BuilderLinkComponent;

        /**
         * Decodes a BuilderLinkComponent message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns BuilderLinkComponent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.BuilderLinkComponent;

        /**
         * Verifies a BuilderLinkComponent message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BuilderLinkComponent message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BuilderLinkComponent
         */
        public static fromObject(object: { [k: string]: any }): pb.BuilderLinkComponent;

        /**
         * Creates a plain object from a BuilderLinkComponent message. Also converts values to other types if specified.
         * @param message BuilderLinkComponent
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.BuilderLinkComponent, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BuilderLinkComponent to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace BuilderLinkComponent {

        /** Properties of a Link. */
        interface ILink {

            /** Link entity */
            entity?: (number|Long|null);

            /** Link revision */
            revision?: (number|Long|null);
        }

        /** Represents a Link. */
        class Link implements ILink {

            /**
             * Constructs a new Link.
             * @param [properties] Properties to set
             */
            constructor(properties?: pb.BuilderLinkComponent.ILink);

            /** Link entity. */
            public entity: (number|Long);

            /** Link revision. */
            public revision: (number|Long);

            /**
             * Creates a new Link instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Link instance
             */
            public static create(properties?: pb.BuilderLinkComponent.ILink): pb.BuilderLinkComponent.Link;

            /**
             * Encodes the specified Link message. Does not implicitly {@link pb.BuilderLinkComponent.Link.verify|verify} messages.
             * @param message Link message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: pb.BuilderLinkComponent.ILink, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Link message, length delimited. Does not implicitly {@link pb.BuilderLinkComponent.Link.verify|verify} messages.
             * @param message Link message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: pb.BuilderLinkComponent.ILink, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Link message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Link
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.BuilderLinkComponent.Link;

            /**
             * Decodes a Link message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Link
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.BuilderLinkComponent.Link;

            /**
             * Verifies a Link message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Link message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Link
             */
            public static fromObject(object: { [k: string]: any }): pb.BuilderLinkComponent.Link;

            /**
             * Creates a plain object from a Link message. Also converts values to other types if specified.
             * @param message Link
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: pb.BuilderLinkComponent.Link, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Link to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a ModelInsertInfo. */
    interface IModelInsertInfo {

        /** ModelInsertInfo flags */
        flags?: (number|null);

        /** ModelInsertInfo box */
        box?: (number[]|null);

        /** ModelInsertInfo type */
        type?: (string|null);
    }

    /** Represents a ModelInsertInfo. */
    class ModelInsertInfo implements IModelInsertInfo {

        /**
         * Constructs a new ModelInsertInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb.IModelInsertInfo);

        /** ModelInsertInfo flags. */
        public flags: number;

        /** ModelInsertInfo box. */
        public box: number[];

        /** ModelInsertInfo type. */
        public type: string;

        /**
         * Creates a new ModelInsertInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ModelInsertInfo instance
         */
        public static create(properties?: pb.IModelInsertInfo): pb.ModelInsertInfo;

        /**
         * Encodes the specified ModelInsertInfo message. Does not implicitly {@link pb.ModelInsertInfo.verify|verify} messages.
         * @param message ModelInsertInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb.IModelInsertInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ModelInsertInfo message, length delimited. Does not implicitly {@link pb.ModelInsertInfo.verify|verify} messages.
         * @param message ModelInsertInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb.IModelInsertInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ModelInsertInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ModelInsertInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): pb.ModelInsertInfo;

        /**
         * Decodes a ModelInsertInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ModelInsertInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): pb.ModelInsertInfo;

        /**
         * Verifies a ModelInsertInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ModelInsertInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ModelInsertInfo
         */
        public static fromObject(object: { [k: string]: any }): pb.ModelInsertInfo;

        /**
         * Creates a plain object from a ModelInsertInfo message. Also converts values to other types if specified.
         * @param message ModelInsertInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: pb.ModelInsertInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ModelInsertInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
