const storage = {
  get(item) {
    try {
      return JSON.parse(localStorage.getItem(item));
    } catch (e) {
      return null;
    }
  },
  set(item, value) {
    localStorage.setItem(item, JSON.stringify(value));
  }
};

export { storage };
