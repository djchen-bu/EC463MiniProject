/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Shortcuts to DOM Elements.
var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');
var recentPostsSection = document.getElementById('recent-posts-list');
var recentMenuButton = document.getElementById('menu-recent');

/**
 * Saves a new post to the Firebase DB.
 */
// [START write_fan_out]

function startDatabaseQueries() {
  // [START my_top_posts_query]
  var d = new Date();
  var min = d.getMinutes();
  var myUserId = firebase.auth().currentUser.uid;
  var temperature = firebase.database().ref('sensor/1/' + min + '/temperature');
  var humidity = firebase.database().ref('sensor/1/' + min + '/humidity');

  temperature.on('value', function(snapshot) {
    document.getElementById("demo").innerHTML = "Temperature: " + snapshot.val();
  });

  humidity.on('value', function(snapshot) { 
    document.getElementById("demo2").innerHTML = "Humidity: " + snapshot.val();
  });

  console.log(min);
}

/**
 * Writes the user's data to the database.
 */
// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl,
  });
}
// [END basic_write]


/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid) {
    return;
  }

  if (user) {
    currentUID = user.uid;
    splashPage.style.display = 'none';
    writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    startDatabaseQueries();

  } else {
    // Set currentUID to null.
    currentUID = null;
    // Display the splash page where you can sign-in.
    splashPage.style.display = '';
  }
}

/**
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
  recentPostsSection.style.display = 'none';
  recentMenuButton.classList.remove('is-active');
}
function handleSignOut() {
  var googleAuth = gapi.auth2.getAuthInstance();
  googleAuth.signOut().then(function() {
    firebase.auth().signOut();
  });
  location.reload();
}
function onSignIn(googleUser) {
  console.log('Google Auth Response', googleUser);
  // We need to register an Observer on Firebase Auth to make sure auth is initialized.
  var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
    unsubscribe();
    // Check if we are already signed-in Firebase with the correct user.
    if (!isUserEqual(googleUser, firebaseUser)) {
      // Build Firebase credential with the Google ID token.
      // [START googlecredential]
      var credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.getAuthResponse().id_token);
      // [END googlecredential]
      // Sign in with credential from the Google user.
      // [START authwithcred]
      firebase.auth().signInAndRetrieveDataWithCredential(credential).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // [START_EXCLUDE]
        if (errorCode === 'auth/account-exists-with-different-credential') {
          alert('You have already signed up with a different auth provider for that email.');
          // If you are using multiple auth providers on your app you should handle linking
          // the user's accounts here.
        } else {
          console.error(error);
        }
        // [END_EXCLUDE]
      });
      // [END authwithcred]
    } else {
      console.log('User already signed-in Firebase.');
    }
  });
}

function isUserEqual(googleUser, firebaseUser) {
  if (firebaseUser) {
    var providerData = firebaseUser.providerData;
    for (var i = 0; i < providerData.length; i++) {
      if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()) {
        // We don't need to reauth the Firebase connection.
        return true;
      }
    }
  }
  return false;
}


// Bindings on load.
window.addEventListener('load', function() {

  // Bind Sign out button.
  signOutButton.addEventListener('click', handleSignOut, false);

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

  // Bind menu buttons.
  recentMenuButton.onclick = function() {
    showSection(recentPostsSection, recentMenuButton);
  };

}, false);

var now = new Date();
var delay = 60 * 1000; // 1 min in msec
var start = delay - (now.getSeconds()) * 1000 + now.getMilliseconds();

setTimeout(function setTimer() {
  startDatabaseQueries();
    setTimeout(setTimer, delay);
}, start);    
