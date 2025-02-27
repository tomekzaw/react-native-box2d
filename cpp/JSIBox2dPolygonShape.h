//
// Created by Hanno Gödecke on 15.07.22.
//

#pragma once

#include "box2d/b2_polygon_shape.h"

namespace Box2d {
    using namespace facebook;

    class JSIBox2dPolygonShape : public JsiWrappingSharedPtrHostObject<b2PolygonShape> {
    public:

        JSI_HOST_FUNCTION(SetAsBox) {
            getObject()->SetAsBox(
                    arguments[0].asNumber(),
                    arguments[1].asNumber()
            );
            return jsi::Value::undefined();
        }

        JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JSIBox2dPolygonShape, SetAsBox))

        /**
         * Constructor
         */
        JSIBox2dPolygonShape(const b2PolygonShape &shape)
                : JsiWrappingSharedPtrHostObject<b2PolygonShape>(
                std::make_shared<b2PolygonShape>(std::move(shape))) {}

        /**
        * Returns the underlying object from a host object of this type
        */
        static std::shared_ptr<b2PolygonShape> fromValue(jsi::Runtime &runtime,
                                                         const jsi::Value &obj) {
            return obj.asObject(runtime)
                    .asHostObject<JSIBox2dPolygonShape>(runtime)
                    ->getObject();
        }

        static const jsi::HostFunctionType
        createCtor() {
            return JSI_HOST_FUNCTION_LAMBDA {
                b2PolygonShape shape;

                return jsi::Object::createFromHostObject(
                        runtime,
                        std::make_shared<JSIBox2dPolygonShape>(
                                std::move(shape)
                        )
                );
            };
        };
    };
}
