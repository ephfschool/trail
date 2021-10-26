import init from "./log";

var json = {};

function launch(type) {
  if (!type) type = "json";
  let refKey;
  if (!firebase.apps.length) {
    init();
  }
  const database = firebase.database();
  const ref = database.ref(type);
  let onEventFunctions = [];
  let lastEventId = 0;
  let eventKey;
  ref.on(
    "value",
    (data) => {
      const elements = data.val();
      if (Object.keys(elements).length == 0) {
        ref.push({ json: true });
      }
      refKey = Object.keys(elements)[0];
      json = elements[refKey];
      eventKey = Object.keys(elements)[1];
      const event = elements[eventKey];
      if (event && event.id > lastEventId) {
        onEventFunctions.forEach((eventFunction) => {
          eventFunction(event.value);
        });
        lastEventId = event.id;
      }
    },
    (e) => {
      console.error(`error in getting data\n${e}`);
    }
  );
  return {
    firebase,
    async setJson(key, value) {
      return new Promise(async (resolve, reject) => {
        const f = async () => {
          json[key] = value;
          await database.ref(`${type}/${refKey}`).set({ ...json });
        };
        if (refKey) {
          resolve(await f());
        } else {
          const interval = setInterval(async () => {
            if (refKey) {
              clearInterval(interval);
              resolve(await f());
            }
          });
        }
      });
    },
    async ready() {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (refKey) {
            clearInterval(interval);
            resolve();
          }
        });
      });
    },
    onEvent(f) {
      onEventFunctions.push(f);
    },
    async createEvent(eventType, value) {
      if (!eventKey) {
        await ref.push({
          id: ++lastEventId,
          value: { type: eventType, value }
        });
      } else {
        await database.ref(`${type}/${eventKey}`).set({
          id: ++lastEventId,
          value: {
            type: eventType,
            value
          }
        });
      }
    }
  };
}

export { launch, json };
