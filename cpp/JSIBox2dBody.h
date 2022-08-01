//
// Created by Hanno Gödecke on 15.07.22.
//

#pragma once

#include <box2d/b2_body.h>

#include "JSIBox2dVec2.h"
#include "JSIBox2dFixtureDef.h"

#include <jsi/jsi.h>
#include "jsi/JsiWrappingHostObjects.h"
#include "utils.h"
#include <android/log.h>

namespace Box2d {
    using namespace facebook;

    class JSIBox2dBody : public JsiWrappingHostObject<b2Body *> {
    public:
        /**
         * Constructor
         */
        JSIBox2dBody(b2Body *body)
                : JsiWrappingHostObject<b2Body *>(body) {}

        JSI_HOST_FUNCTION(GetPosition) {
            return JSIBox2dVec2::toValue(runtime, getObject()->GetPosition());
        }

        JSI_HOST_FUNCTION(GetAngle) {
            return jsi::Value((double) getObject()->GetAngle());
        }

        JSI_HOST_FUNCTION(CreateFixture) {
            if (arguments[0].isObject()) {
                const auto obj = arguments[0].asObject(runtime);
                if (obj.isHostObject<JSIBox2dFixtureDef>(runtime)) {
                    getObject()->CreateFixture(
                            JSIBox2dFixtureDef::fromValue(runtime, arguments[0]).get());
                    return jsi::Value::undefined();
                }
            }

            jsi::detail::throwJSError(runtime, "Unsupported shape type");
            return jsi::Value::undefined();
        }

        JSI_HOST_FUNCTION(CreateFixture2) {
            b2Shape *shape = Utils::getShape(runtime, arguments[0]);
            getObject()->CreateFixture(shape, arguments[1].asNumber());
            return jsi::Value::undefined();
        }

        JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JSIBox2dBody, GetAngle),
                             JSI_EXPORT_FUNC(JSIBox2dBody, GetPosition),
                             JSI_EXPORT_FUNC(JSIBox2dBody, CreateFixture),
                             JSI_EXPORT_FUNC(JSIBox2dBody, CreateFixture2),
        );

    };
}