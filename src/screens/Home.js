import React from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import styles from "../styles/homestyle.js";

const Home = ({ navigation }) => {
  const renderContenido = () => (
    <>
      {/* 1. HERO SECTION */}
      <ImageBackground
        source={require("../../assets/portadaFirstPage.png")}
        style={{ width: "100%", height: 450 }}
        resizeMode="cover"
      >
        {/* Aseguramos que el overlay no bloquee los clics con flex */}
        <View style={styles.headerOverlay}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View>
              <Text style={styles.logoText}>edusupernova</Text>
              <Text style={styles.tagline}>Learn. Dominate. Shine.</Text>
            </View>
            <Image
              source={require("../../assets/iconoGraduacion-removebg-preview.png")}
              style={{ width: 100, height: 100 }}
              resizeMode="cover"
            />
          </View>
          <View style={styles.authButtons}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.loginBtn}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginBtnText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.registerBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.registerBtnText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* 2. RESULTS THAT SPEAK */}
      <View style={styles.mainResultsRow}>
        <View style={styles.leftTextCol}>
          <Text style={styles.sectionTitle}>Results That Speak:</Text>
          <Text style={styles.bulletText}>
            • +25% in grades by practicing with 500 real questions per subject,
            designed to cover what most often appears on exams.
          </Text>
          <Text style={styles.bulletText}>
            • -70% repeated mistakes thanks to personalized Gemini AI feedback,
            which corrects you instantly and teaches you not to stumble twice.
          </Text>
          <Text style={styles.bulletText}>
            • 100% prepared because you study with Active Recall: random tests
            that force you to actively remember, not passively reread.
          </Text>
        </View>

        <View style={styles.centerCardCol}>
          <Text style={styles.tealTitle}>We Offer:</Text>
          <Text style={styles.tealItem}>• 500 real questions per exam</Text>
          <Text style={styles.tealItem}>• Random tests (20 questions) </Text>
          <Text style={styles.tealItem}>• AI-generated feedback</Text>
        </View>

        <View style={styles.rightImageCol}>
          <Image
            source={require("../../assets/library.png")}
            style={styles.sideImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* 3. SPLIT SECTION */}
      {/*<View style={styles.splitSection}>
        <Image
          source={require("../../assets/library.png")}
          style={styles.libraryImage}
        />
        <View style={styles.tanCard}>
          <Text style={styles.tanItem}>• Clear summaries.</Text>
          <Text style={styles.tanItem}>• Smart tests.</Text>
          <Text style={styles.tanItem}>• AI Feedback.</Text>
        </View>
      </View>*/}

      {/* 4. METHODOLOGY */}
      <View style={styles.methodContainer}>
        <Text style={styles.methodTitle}>
          The method used by top students emphasizes efficiency and the power of
          active recall.
        </Text>
        <Text style={styles.methodText}>
          Start by reading the summary of the material, which allows you to
          grasp the main concepts quickly. Once you close the book, test your
          understanding immediately. This process helps solidify the information
          in your memory. Actively recalling information strengthens neural
          connections, making it easier to retrieve the information later.
          Additionally, using AI tools to check your answers provides instant
          feedback, helping you correct mistakes and reinforce learning on the
          spot. By focusing on these strategies, you optimize your study
          sessions, ensuring you don’t just study more, but study smarter.
          Activate your memory now and unlock your full potential!
        </Text>
      </View>

      {/* 5. CTA SECTION */}
      <View style={styles.ctaSection}>
        <Text style={styles.logoBig}>Edusupernova</Text>
        <Text
          style={{
            fontSize: 20,
            marginBottom: 10,
            fontFamily: "Newsreader_400Regular",
          }}
        >
          Totally Free!
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.ctaButtonText}>START IN JUST 10s!</Text>
        </TouchableOpacity>
      </View>

      {/* 6. FOOTER */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerText}>Contact | About Us</Text>
          <Text style={styles.footerText}>Terms and Conditions</Text>
        </View>
        <View style={styles.socialIcons}>
          <Image
            source={require("../../assets/Instagram.png")}
            style={styles.icon}
          />
          <Image
            source={require("../../assets/LinkedInIcon.png")}
            style={styles.icon}
          />
          <Image
            source={require("../../assets/TikTokIcon.png")}
            style={styles.icon}
          />
        </View>
        <Text style={styles.footerText}>© 2026 Edusupernova</Text>
      </View>
    </>
  );
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          height: "100vh",
          overflowY: "auto",
          backgroundColor: "#fff",
        }}
      >
        {renderContenido()}
      </div>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={true}
    >
      {renderContenido()}
    </ScrollView>
  );
};

export default Home;
