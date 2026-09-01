"""Standalone test for password hashing implementation."""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.core.security import get_password_hash, verify_password


def test_basic_password():
    """Test basic password hashing and verification."""
    password = "test_password_123"
    hashed = get_password_hash(password)

    print(f"✓ Password hashed successfully")
    print(f"  Hash format: {hashed[:50]}...")

    # Verify correct password
    assert verify_password(password, hashed), "Failed to verify correct password"
    print(f"✓ Correct password verified")

    # Verify incorrect password
    assert not verify_password("wrong_password", hashed), "Incorrectly verified wrong password"
    print(f"✓ Wrong password rejected")


def test_long_password():
    """Test passwords longer than 72 bytes (bcrypt limit)."""
    long_password = "A" * 150 + "!ComplexPassword123"
    hashed = get_password_hash(long_password)

    print(f"✓ Long password ({len(long_password)} chars) hashed successfully")

    # Verify exact long password
    assert verify_password(long_password, hashed), "Failed to verify long password"
    print(f"✓ Long password verified correctly")

    # Verify slightly different long password fails
    assert not verify_password(long_password + "x", hashed), "Incorrectly verified modified long password"
    print(f"✓ Modified long password rejected")


def test_special_characters():
    """Test passwords with special characters and unicode."""
    passwords = [
        "p@ssw0rd!#$%",
        "пароль123",  # Cyrillic
        "密碼test",     # Chinese
        "🔒🔑secure",  # Emoji
        "tab\ttab newline\nnewline",
    ]

    for pwd in passwords:
        hashed = get_password_hash(pwd)
        assert verify_password(pwd, hashed), f"Failed to verify: {pwd[:20]}"

    print(f"✓ All {len(passwords)} special character passwords verified")


def test_empty_and_short():
    """Test edge cases."""
    # Short password
    short = "a"
    hashed = get_password_hash(short)
    assert verify_password(short, hashed)
    print(f"✓ Single character password works")

    # Empty password (edge case - some systems allow this)
    empty = ""
    hashed = get_password_hash(empty)
    assert verify_password(empty, hashed)
    print(f"✓ Empty password handled")


def test_different_passwords_different_hashes():
    """Ensure same password gets different salts."""
    password = "same_password"
    hash1 = get_password_hash(password)
    hash2 = get_password_hash(password)

    assert hash1 != hash2, "Same password produced identical hashes (salt not random)"
    print(f"✓ Same password produces different hashes (random salt working)")

    # But both should verify
    assert verify_password(password, hash1)
    assert verify_password(password, hash2)
    print(f"✓ Both hashes verify correctly")


if __name__ == "__main__":
    print("Testing PBKDF2-HMAC-SHA256 password hashing implementation\n")
    print("=" * 60)

    try:
        test_basic_password()
        print()
        test_long_password()
        print()
        test_special_characters()
        print()
        test_empty_and_short()
        print()
        test_different_passwords_different_hashes()
        print()
        print("=" * 60)
        print("✅ ALL TESTS PASSED")
        sys.exit(0)
    except AssertionError as e:
        print()
        print("=" * 60)
        print(f"❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
