1. What exactly does whitelist: true strip away, and why does an attacker care about it?

2. Why did the 404 in step 2c prove anything at all?

### 5b - Login timing hardening

When a username does not exist, AuthService still runs bcrypt.compare()
against a fixed dummy hash before returning the error. This makes the
unknown-user path perform similar password-hashing work as the wrong-password
path, reducing the timing difference that could reveal whether a username exists.