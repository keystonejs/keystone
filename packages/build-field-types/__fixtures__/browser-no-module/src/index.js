let thing = "wow";

if (typeof window !== "undefined") {
  thing = "something";
}

if (typeof document !== undefined) {
  thing += "other";
}

export default thing;
