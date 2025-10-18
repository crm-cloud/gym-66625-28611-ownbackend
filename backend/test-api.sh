#!/bin/bash

# Fitverse API Testing Script
# Make executable: chmod +x test-api.sh
# Run: ./test-api.sh

set -e  # Exit on error

API_URL="http://localhost:3001"
ADMIN_EMAIL="admin@fitverse.com"
ADMIN_PASSWORD="Admin123!@#"

echo "🚀 Fitverse API Test Suite"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_status=$5
  
  echo -n "Testing: $name... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
    ((TESTS_PASSED++))
    echo "$body"
  else
    echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
    echo "$body"
    ((TESTS_FAILED++))
  fi
  echo ""
}

# Step 1: Login
echo "Step 1: Authentication"
echo "----------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed!${NC}"
  echo "Response: $LOGIN_RESPONSE"
  echo ""
  echo "Make sure you have:"
  echo "1. Created an admin user in the database"
  echo "2. Set the correct password hash"
  echo "3. Backend is running on $API_URL"
  exit 1
else
  echo -e "${GREEN}✓ Login successful!${NC}"
  echo "Token: ${TOKEN:0:50}..."
  echo ""
fi

# Step 2: Test Health Check
echo "Step 2: Health Check"
echo "--------------------"
test_endpoint "Health Check" "GET" "/health" "" 200

# Step 3: Test Branches
echo "Step 3: Branches API"
echo "--------------------"

# Create branch
BRANCH_DATA='{
  "name": "Test Branch",
  "code": "TB01",
  "city": "Mumbai",
  "phone": "9876543210",
  "status": "active"
}'
BRANCH_RESPONSE=$(curl -s -X POST "$API_URL/api/branches" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BRANCH_DATA")
BRANCH_ID=$(echo $BRANCH_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$BRANCH_ID" ]; then
  echo -e "${GREEN}✓ Branch created${NC} (ID: $BRANCH_ID)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ Branch creation failed${NC}"
  echo "$BRANCH_RESPONSE"
  ((TESTS_FAILED++))
fi
echo ""

test_endpoint "Get All Branches" "GET" "/api/branches" "" 200
test_endpoint "Get Branch by ID" "GET" "/api/branches/$BRANCH_ID" "" 200

# Step 4: Test Membership Plans
echo "Step 4: Membership Plans API"
echo "-----------------------------"

PLAN_DATA='{
  "name": "Basic Monthly",
  "duration_days": 30,
  "price": 1500,
  "category": "basic",
  "is_active": true
}'
PLAN_RESPONSE=$(curl -s -X POST "$API_URL/api/membership-plans" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PLAN_DATA")
PLAN_ID=$(echo $PLAN_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$PLAN_ID" ]; then
  echo -e "${GREEN}✓ Plan created${NC} (ID: $PLAN_ID)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ Plan creation failed${NC}"
  ((TESTS_FAILED++))
fi
echo ""

test_endpoint "Get All Plans" "GET" "/api/membership-plans" "" 200
test_endpoint "Get Popular Plans" "GET" "/api/membership-plans/popular" "" 200

# Step 5: Test Trainers
echo "Step 5: Trainers API"
echo "--------------------"

TRAINER_DATA="{
  \"name\": \"Test Trainer\",
  \"email\": \"trainer@test.com\",
  \"phone\": \"9876543211\",
  \"specialization\": \"Yoga\",
  \"branch_id\": \"$BRANCH_ID\",
  \"hourly_rate\": 1500,
  \"is_active\": true
}"
TRAINER_RESPONSE=$(curl -s -X POST "$API_URL/api/trainers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$TRAINER_DATA")
TRAINER_ID=$(echo $TRAINER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$TRAINER_ID" ]; then
  echo -e "${GREEN}✓ Trainer created${NC} (ID: $TRAINER_ID)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ Trainer creation failed${NC}"
  ((TESTS_FAILED++))
fi
echo ""

test_endpoint "Get All Trainers" "GET" "/api/trainers" "" 200

# Step 6: Test Members
echo "Step 6: Members API"
echo "-------------------"

MEMBER_DATA="{
  \"name\": \"Test Member\",
  \"email\": \"member@test.com\",
  \"phone\": \"9876543212\",
  \"gender\": \"male\",
  \"branch_id\": \"$BRANCH_ID\",
  \"assigned_trainer_id\": \"$TRAINER_ID\",
  \"membership_plan_id\": \"$PLAN_ID\"
}"
MEMBER_RESPONSE=$(curl -s -X POST "$API_URL/api/members" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$MEMBER_DATA")
MEMBER_ID=$(echo $MEMBER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$MEMBER_ID" ]; then
  echo -e "${GREEN}✓ Member created${NC} (ID: $MEMBER_ID)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ Member creation failed${NC}"
  ((TESTS_FAILED++))
fi
echo ""

test_endpoint "Get All Members" "GET" "/api/members" "" 200
test_endpoint "Get Member Stats" "GET" "/api/members/stats" "" 200

# Step 7: Test Classes
echo "Step 7: Classes API"
echo "-------------------"

FUTURE_DATE=$(date -u -d "+1 day" +"%Y-%m-%dT06:00:00Z" 2>/dev/null || date -u -v+1d +"%Y-%m-%dT06:00:00Z" 2>/dev/null || echo "2024-12-31T06:00:00Z")
END_DATE=$(date -u -d "+1 day" +"%Y-%m-%dT07:00:00Z" 2>/dev/null || date -u -v+1d +"%Y-%m-%dT07:00:00Z" 2>/dev/null || echo "2024-12-31T07:00:00Z")

CLASS_DATA="{
  \"name\": \"Morning Yoga\",
  \"trainer_id\": \"$TRAINER_ID\",
  \"branch_id\": \"$BRANCH_ID\",
  \"start_time\": \"$FUTURE_DATE\",
  \"end_time\": \"$END_DATE\",
  \"max_capacity\": 20,
  \"class_type\": \"Yoga\"
}"
CLASS_RESPONSE=$(curl -s -X POST "$API_URL/api/classes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CLASS_DATA")
CLASS_ID=$(echo $CLASS_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$CLASS_ID" ]; then
  echo -e "${GREEN}✓ Class created${NC} (ID: $CLASS_ID)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ Class creation failed${NC}"
  ((TESTS_FAILED++))
fi
echo ""

test_endpoint "Get All Classes" "GET" "/api/classes" "" 200
test_endpoint "Get Upcoming Classes" "GET" "/api/classes/upcoming" "" 200

# Step 8: Test Auth
echo "Step 8: Authentication Tests"
echo "-----------------------------"

# No token (should fail)
echo -n "Testing: No Token (should fail)... "
NO_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/members")
NO_TOKEN_STATUS=$(echo "$NO_TOKEN_RESPONSE" | tail -n1)
if [ "$NO_TOKEN_STATUS" -eq "401" ]; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (Expected 401, Got $NO_TOKEN_STATUS)"
  ((TESTS_FAILED++))
fi
echo ""

# Step 9: Summary
echo ""
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC} 🎉"
  echo ""
  echo "Phase 4 is working correctly!"
  echo "You can proceed to Phase 5."
  exit 0
else
  echo -e "${YELLOW}⚠ Some tests failed${NC}"
  echo ""
  echo "Please check the errors above and:"
  echo "1. Verify database migrations are applied"
  echo "2. Check server logs for errors"
  echo "3. Ensure all environment variables are set"
  exit 1
fi
