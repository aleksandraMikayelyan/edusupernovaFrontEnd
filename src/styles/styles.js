import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  body: {
    fontFamily: "Poppins",
    backgroundColor: "#fdfdfd",
    color: "#222",
    margin: 0,
    padding: 0,
    flex: 1,
  },
  header: {
    backgroundColor: "#009688",
    color: "#fff",
    textAlign: "center",
    paddingVertical: 20,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#009688",
  },
  navLink: {
    color: "#009688",
    marginHorizontal: 20,
    fontWeight: "600",
  },
  main: {
    paddingVertical: 40,
    paddingHorizontal: "10%",
  },
  heading: {
    color: "#009688",
    fontWeight: "700",
  },
  paragraph: {
    lineHeight: 24,
    marginBottom: 20,
    color: "#222",
  },
  button: {
    backgroundColor: "#009688",
    color: "#fff",
    borderWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    fontWeight: "600",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonHover: {
    backgroundColor: "#009688",
  },
  form: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 30,
    maxWidth: 400,
    alignSelf: "center",
    marginVertical: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  inputFocus: {
    borderColor: "#009688",
  },
  feedbackBox: {
    backgroundColor: "#fff5f8",
    borderLeftWidth: 4,
    borderLeftColor: "#009688",
    padding: 20,
    marginVertical: 20,
    borderRadius: 6,
  },
  card: {
    backgroundColor: "#fff",
  },
});

export default styles;
