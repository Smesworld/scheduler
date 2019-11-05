import reducer, { SET_WEBSOCKET, SET_DAY, SET_APPLICATION_DATA, SET_INTERVIEW} from "reducers/application";

describe("Application Reducer", () => {
  it("throws an error with an unsupported type", () => {
    expect(() => reducer({}, { type: null}))
      .toThrowError( /tried to reduce with unsupported action type/i);
  });
})