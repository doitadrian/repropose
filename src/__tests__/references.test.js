import { compose } from "ramda";
import { withProps } from "repropose";

test(`"this" / "instance" references test`, async () => {
    const Model = compose(
        withProps(instance => {
            return {
                object: { ...instance.object, number: 30 },
                number: 10
            };
        }),
        withProps(instance => ({
            getObject() {
                return this.object;
            },
            object: {
                number: 1
            },
            number: 3,
            numbersX2() {
                return [
                    instance.number * 2,
                    instance.object.number * 2,
                    this.getObject().number * 2,
                    instance.getObject().number * 2
                ];
            }
        }))
    )(function() {});

    const model = new Model();

    expect(model.number).toBe(10);
    expect(model.numbersX2()).toEqual([6, 2, 60, 2]);

    expect(Object.keys(model)).toEqual(["getObject", "object", "number", "numbersX2"]);

    model.object.number = 10;
    model.number = 30;

    expect(model.number).toBe(30);
    expect(model.getObject().number).toBe(10);
    expect(model.object.number).toBe(10);

    model.getObject().number = 30;
    expect(model.getObject().number).toBe(30);
    expect(model.object.number).toBe(30);
});

test(`"this" / "instance" references test 2`, async () => {
    const Model = compose(
        withProps({
            fields: { number: { value: 5 } }
        }),
        withProps(instance => ({
            fields: {},
            getField(name) {
                return this.fields[name];
            },
            numbersX3: () => {
                return [instance.fields.number, instance.getField("number")];
            },
            numbersX3Function() {
                return [
                    instance.fields.number,
                    instance.getField("number"),
                    this.getField("number").value * 3
                ];
            }
        }))
    )(function() {});

    const model = new Model();

    expect(model.numbersX3()).toEqual([undefined, undefined]);
    expect(model.numbersX3Function()).toEqual([undefined, undefined, 15]);
});

test(`object are carried by reference, even when instantiating :/`, async () => {
    // This means once you assign an object via withProps to a key,
    // it will be 'static' or in other words, every instance will carry
    // a reference to it. If you change a value in one of the instances,
    // all instances will see the change. Might be good in some cases, but
    // in others not.

    const Model = compose(
        withProps({
            someObject: { someKey: { someOtherKey: "value" } }
        })
    )(function() {});

    const model1 = new Model();
    const model2 = new Model();

    expect(model1.someObject).toEqual({ someKey: { someOtherKey: "value" } });
    expect(model2.someObject).toEqual({ someKey: { someOtherKey: "value" } });

    model1.someObject.someKey = { itIsNow: "empty" };

    expect(model1.someObject).toEqual({ someKey: { itIsNow: "empty" } });
    expect(model2.someObject).toEqual({ someKey: { itIsNow: "empty" } });

    model1.someObject.someKey = 123;
    expect(model1.someObject).toEqual({ someKey: 123 });
    expect(model2.someObject).toEqual({ someKey: 123 });
});

test(`objects are carried by reference - use functions to avoid if necessary`, async () => {
    const Model = compose(
        withProps(() => ({
            someObject: {
                someKey: {
                    someOtherKey: "value"
                }
            }
        }))
    )(function() {});

    const model1 = new Model();
    const model2 = new Model();

    expect(model1.someObject).toEqual({ someKey: { someOtherKey: "value" } });
    expect(model2.someObject).toEqual({ someKey: { someOtherKey: "value" } });

    model1.someObject.someKey = { itIsNow: "empty" };

    expect(model1.someObject).toEqual({ someKey: { itIsNow: "empty" } });
    expect(model2.someObject).toEqual({ someKey: { someOtherKey: "value" } });

    model1.someObject.someKey = 123;
    expect(model1.someObject).toEqual({ someKey: 123 });
    expect(model2.someObject).toEqual({ someKey: { someOtherKey: "value" } });
});