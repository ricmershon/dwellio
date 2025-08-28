#!/bin/bash

# Script to detect duplicate mocks that could cause conflicts
# Run this before adding new tests to prevent mock contamination

echo "🔍 Analyzing duplicate mocks across test files..."
echo "=================================================="

echo
echo "📦 react-toastify mocks:"
grep -r "jest.mock('react-toastify'" __tests__/ | cut -d: -f1 | sort | uniq -c | sort -nr

echo
echo "📦 next/navigation mocks:"
grep -r "jest.mock('next/navigation'" __tests__/ | cut -d: -f1 | sort | uniq -c | sort -nr

echo
echo "📦 next/link mocks:" 
grep -r "jest.mock('next/link'" __tests__/ | cut -d: -f1 | sort | uniq -c | sort -nr

echo
echo "📦 next-auth/react mocks:"
grep -r "jest.mock('next-auth/react'" __tests__/ | cut -d: -f1 | sort | uniq -c | sort -nr

echo
echo "📦 clsx mocks:"
grep -r "jest.mock('clsx'" __tests__/ | cut -d: -f1 | sort | uniq -c | sort -nr

echo
echo "⚠️  POTENTIAL CONFLICTS:"
echo "========================"

# Check for modules that are mocked by multiple test files
echo "🔴 react-toastify conflicts:"
grep -r "jest.mock('react-toastify'" __tests__/ | grep -v "createReactToastifyMock" | wc -l | xargs -I {} echo "   {} files with different implementations"

echo
echo "🟡 Most frequently mocked modules:"
grep -r "jest.mock(" __tests__/ | sed "s/.*jest.mock('\([^']*\)'.*/\1/" | sort | uniq -c | sort -nr | head -10

echo
echo "✅ Using unified mocks from test-utils.tsx:"
grep -r "createReactToastifyMock\|createNextLinkMock\|mockNextAuth" __tests__/ | wc -l | xargs -I {} echo "   {} files using unified mocks"

echo
echo "💡 Recommendation: Use unified mocks from test-utils.tsx to prevent conflicts"