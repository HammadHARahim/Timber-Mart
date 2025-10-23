#!/bin/bash

# ============================================================================
# Phase 6 Services Comprehensive Test Script
# Tests all three services: PrintTemplate, Token, Print
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5001/api"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Cleanup function
cleanup() {
    rm -f /tmp/test_token.txt /tmp/test_template_id.txt /tmp/test_token_id.txt
}

trap cleanup EXIT

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
    echo -e "${YELLOW}TEST: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ PASS: $1${NC}"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}✗ FAIL: $1${NC}"
    echo -e "${RED}  Response: $2${NC}"
    ((TESTS_FAILED++))
}

# Login and get token
login() {
    print_header "AUTHENTICATION"
    print_test "Login as admin"

    RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}')

    TOKEN=$(echo "$RESPONSE" | jq -r '.token')

    if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
        print_success "Login successful"
        echo "$TOKEN" > /tmp/test_token.txt
    else
        print_error "Login failed" "$RESPONSE"
        exit 1
    fi
}

# ============================================================================
# PRINT TEMPLATE SERVICE TESTS
# ============================================================================
test_print_templates() {
    print_header "PRINT TEMPLATE SERVICE TESTS"
    TOKEN=$(cat /tmp/test_token.txt)

    # Test 1: Get all templates
    print_test "GET all templates"
    RESPONSE=$(curl -s -X GET "$BASE_URL/print-templates" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        print_success "Get all templates"
    else
        print_error "Get all templates" "$RESPONSE"
    fi

    # Test 2: Get templates with pagination
    print_test "GET templates with pagination (page=1, limit=5)"
    RESPONSE=$(curl -s -X GET "$BASE_URL/print-templates?page=1&limit=5" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    TOTAL=$(echo "$RESPONSE" | jq -r '.data.pagination.total')
    if [ "$SUCCESS" = "true" ] && [ "$TOTAL" != "null" ]; then
        print_success "Pagination works (total: $TOTAL)"
    else
        print_error "Pagination" "$RESPONSE"
    fi

    # Test 3: Filter by type=TOKEN
    print_test "GET templates filtered by type=TOKEN"
    RESPONSE=$(curl -s -X GET "$BASE_URL/print-templates?type=TOKEN" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        print_success "Filter by type TOKEN"
    else
        print_error "Filter by type" "$RESPONSE"
    fi

    # Test 4: Filter by is_active=true
    print_test "GET templates filtered by is_active=true"
    RESPONSE=$(curl -s -X GET "$BASE_URL/print-templates?is_active=true" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        print_success "Filter by is_active"
    else
        print_error "Filter by is_active" "$RESPONSE"
    fi

    # Test 5: Get single template (TOKEN)
    print_test "GET single template by ID (TOKEN)"
    RESPONSE=$(curl -s -X GET "$BASE_URL/print-templates/TOKEN" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    TEMPLATE_NAME=$(echo "$RESPONSE" | jq -r '.data.name')
    if [ "$SUCCESS" = "true" ] && [ "$TEMPLATE_NAME" != "null" ]; then
        print_success "Get single template: $TEMPLATE_NAME"
    else
        print_error "Get single template" "$RESPONSE"
    fi

    # Test 6: Get template placeholders
    print_test "GET template placeholders for TOKEN type"
    RESPONSE=$(curl -s -X GET "$BASE_URL/print-templates/TOKEN/placeholders" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    PLACEHOLDER_COUNT=$(echo "$RESPONSE" | jq -r '.data.placeholders | length')
    if [ "$SUCCESS" = "true" ] && [ "$PLACEHOLDER_COUNT" -gt "0" ]; then
        print_success "Get placeholders (count: $PLACEHOLDER_COUNT)"
    else
        print_error "Get placeholders" "$RESPONSE"
    fi

    # Test 7: Get non-existent template (should fail gracefully)
    print_test "GET non-existent template (error handling)"
    RESPONSE=$(curl -s -X GET "$BASE_URL/print-templates/9999999" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "false" ]; then
        print_success "Error handling works for non-existent template"
    else
        print_error "Error handling" "$RESPONSE"
    fi

    # Test 8: Create new template
    print_test "POST create new custom template"
    RESPONSE=$(curl -s -X POST "$BASE_URL/print-templates" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Template",
            "description": "Automated test template",
            "type": "CUSTOM",
            "html_content": "<div>{{customer_name}}</div>",
            "css_content": "div { color: black; }",
            "page_size": "A4",
            "orientation": "PORTRAIT",
            "is_active": true,
            "is_default": false
        }')
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        TEMPLATE_ID=$(echo "$RESPONSE" | jq -r '.data.id')
        echo "$TEMPLATE_ID" > /tmp/test_template_id.txt
        print_success "Create template (ID: $TEMPLATE_ID)"
    else
        print_error "Create template" "$RESPONSE"
    fi

    # Test 9: Update template
    if [ -f /tmp/test_template_id.txt ]; then
        TEMPLATE_ID=$(cat /tmp/test_template_id.txt)
        print_test "PUT update template"
        RESPONSE=$(curl -s -X PUT "$BASE_URL/print-templates/$TEMPLATE_ID" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "name": "Test Template Updated",
                "description": "Updated description"
            }')
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
        if [ "$SUCCESS" = "true" ]; then
            print_success "Update template"
        else
            print_error "Update template" "$RESPONSE"
        fi
    fi

    # Test 10: Delete template
    if [ -f /tmp/test_template_id.txt ]; then
        TEMPLATE_ID=$(cat /tmp/test_template_id.txt)
        print_test "DELETE template"
        RESPONSE=$(curl -s -X DELETE "$BASE_URL/print-templates/$TEMPLATE_ID" \
            -H "Authorization: Bearer $TOKEN")
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
        if [ "$SUCCESS" = "true" ]; then
            print_success "Delete template"
        else
            print_error "Delete template" "$RESPONSE"
        fi
    fi
}

# ============================================================================
# TOKEN SERVICE TESTS
# ============================================================================
test_tokens() {
    print_header "TOKEN SERVICE TESTS"
    TOKEN=$(cat /tmp/test_token.txt)

    # Test 1: Get all tokens
    print_test "GET all tokens"
    RESPONSE=$(curl -s -X GET "$BASE_URL/tokens" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        print_success "Get all tokens"
    else
        print_error "Get all tokens" "$RESPONSE"
    fi

    # Test 2: Get tokens with pagination
    print_test "GET tokens with pagination"
    RESPONSE=$(curl -s -X GET "$BASE_URL/tokens?page=1&limit=5" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        print_success "Token pagination"
    else
        print_error "Token pagination" "$RESPONSE"
    fi

    # Test 3: Filter by status
    print_test "GET tokens filtered by status=ACTIVE"
    RESPONSE=$(curl -s -X GET "$BASE_URL/tokens?status=ACTIVE" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        print_success "Filter by status"
    else
        print_error "Filter by status" "$RESPONSE"
    fi

    # Test 4: Create standalone token (no order_id)
    print_test "POST create standalone token"
    RESPONSE=$(curl -s -X POST "$BASE_URL/tokens" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "customer_name": "Test Customer",
            "project_name": "Test Project",
            "vehicle_number": "ABC-123",
            "driver_name": "Test Driver",
            "driver_phone": "1234567890",
            "notes": "Automated test token"
        }')
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        TOKEN_ID=$(echo "$RESPONSE" | jq -r '.data.id')
        echo "$TOKEN_ID" > /tmp/test_token_id.txt
        print_success "Create standalone token (ID: $TOKEN_ID)"
    else
        print_error "Create standalone token" "$RESPONSE"
    fi

    # Test 5: Create token with empty strings for integer fields (edge case)
    print_test "POST create token with empty strings (sanitization test)"
    RESPONSE=$(curl -s -X POST "$BASE_URL/tokens" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "order_id": "",
            "customer_id": "",
            "project_id": "",
            "customer_name": "Edge Case Customer",
            "vehicle_number": "XYZ-999"
        }')
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        print_success "Empty string sanitization works"
    else
        print_error "Empty string sanitization" "$RESPONSE"
    fi

    # Test 6: Get single token
    if [ -f /tmp/test_token_id.txt ]; then
        TOKEN_ID=$(cat /tmp/test_token_id.txt)
        print_test "GET single token by ID"
        RESPONSE=$(curl -s -X GET "$BASE_URL/tokens/$TOKEN_ID" \
            -H "Authorization: Bearer $TOKEN")
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
        if [ "$SUCCESS" = "true" ]; then
            print_success "Get single token"
        else
            print_error "Get single token" "$RESPONSE"
        fi
    fi

    # Test 7: Update token
    if [ -f /tmp/test_token_id.txt ]; then
        TOKEN_ID=$(cat /tmp/test_token_id.txt)
        print_test "PUT update token"
        RESPONSE=$(curl -s -X PUT "$BASE_URL/tokens/$TOKEN_ID" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "vehicle_number": "ABC-456",
                "notes": "Updated notes"
            }')
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
        if [ "$SUCCESS" = "true" ]; then
            print_success "Update token"
        else
            print_error "Update token" "$RESPONSE"
        fi
    fi

    # Test 8: Update token status
    if [ -f /tmp/test_token_id.txt ]; then
        TOKEN_ID=$(cat /tmp/test_token_id.txt)
        print_test "PATCH update token status to USED"
        RESPONSE=$(curl -s -X PATCH "$BASE_URL/tokens/$TOKEN_ID/status" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"status": "USED"}')
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
        if [ "$SUCCESS" = "true" ]; then
            print_success "Update token status"
        else
            print_error "Update token status" "$RESPONSE"
        fi
    fi

    # Test 9: Record print
    if [ -f /tmp/test_token_id.txt ]; then
        TOKEN_ID=$(cat /tmp/test_token_id.txt)
        print_test "POST record token print"
        RESPONSE=$(curl -s -X POST "$BASE_URL/tokens/$TOKEN_ID/print" \
            -H "Authorization: Bearer $TOKEN")
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
        if [ "$SUCCESS" = "true" ]; then
            print_success "Record print"
        else
            print_error "Record print" "$RESPONSE"
        fi
    fi

    # Test 10: Delete token (should fail - token is USED)
    if [ -f /tmp/test_token_id.txt ]; then
        TOKEN_ID=$(cat /tmp/test_token_id.txt)
        print_test "DELETE used token (should fail)"
        RESPONSE=$(curl -s -X DELETE "$BASE_URL/tokens/$TOKEN_ID" \
            -H "Authorization: Bearer $TOKEN")
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
        if [ "$SUCCESS" = "false" ]; then
            print_success "Cannot delete used token (correct behavior)"
        else
            print_error "Delete used token should fail" "$RESPONSE"
        fi
    fi
}

# ============================================================================
# PRINT SERVICE TESTS
# ============================================================================
test_print_service() {
    print_header "PRINT SERVICE TESTS"
    TOKEN=$(cat /tmp/test_token.txt)

    # Test 1: Get user print settings
    print_test "GET user print settings"
    RESPONSE=$(curl -s -X GET "$BASE_URL/print/settings" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        print_success "Get print settings"
    else
        print_error "Get print settings" "$RESPONSE"
    fi

    # Test 2: Update print settings
    print_test "PUT update print settings"
    RESPONSE=$(curl -s -X PUT "$BASE_URL/print/settings" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "auto_print": true,
            "default_copies": 2,
            "printer_name": "Test Printer"
        }')
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        print_success "Update print settings"
    else
        print_error "Update print settings" "$RESPONSE"
    fi

    # Test 3: Generate token print (if test token exists)
    if [ -f /tmp/test_token_id.txt ]; then
        TOKEN_ID=$(cat /tmp/test_token_id.txt)
        print_test "POST generate token print data"
        RESPONSE=$(curl -s -X POST "$BASE_URL/print/token/$TOKEN_ID" \
            -H "Authorization: Bearer $TOKEN")
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
        if [ "$SUCCESS" = "true" ]; then
            print_success "Generate token print data"
        else
            print_error "Generate token print data" "$RESPONSE"
        fi
    fi

    # Test 4: Test invalid token ID for print
    print_test "POST generate print for non-existent token (error handling)"
    RESPONSE=$(curl -s -X POST "$BASE_URL/print/token/9999999" \
        -H "Authorization: Bearer $TOKEN")
    SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
    if [ "$SUCCESS" = "false" ]; then
        print_success "Error handling for invalid token"
    else
        print_error "Error handling" "$RESPONSE"
    fi
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     Phase 6 Services - Comprehensive Test Suite      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

    # Run tests
    login
    test_print_templates
    test_tokens
    test_print_service

    # Summary
    print_header "TEST SUMMARY"
    TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
    echo -e "${GREEN}Passed: $TESTS_PASSED / $TOTAL_TESTS${NC}"
    if [ $TESTS_FAILED -gt 0 ]; then
        echo -e "${RED}Failed: $TESTS_FAILED / $TOTAL_TESTS${NC}"
        exit 1
    else
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    fi
}

# Run main
main
