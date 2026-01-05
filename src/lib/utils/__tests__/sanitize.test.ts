/**
 * Tests for sanitize utility
 */

import { describe, it, expect } from 'vitest'
import {
  escapeHtml,
  stripHtml,
  sanitizeText,
  sanitizeMultilineText,
  sanitizeUrl,
} from '../sanitize'

describe('sanitize', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>'
      const result = escapeHtml(input)
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
    })

    it('should escape ampersand', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b')
    })

    it('should escape quotes', () => {
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;')
      expect(escapeHtml("'quoted'")).toContain('&#x27;')
    })

    it('should escape forward slash', () => {
      expect(escapeHtml('path/to/file')).toContain('&#x2F;')
    })

    it('should escape backtick and equals', () => {
      expect(escapeHtml('`code`')).toContain('&#x60;')
      expect(escapeHtml('a=b')).toContain('&#x3D;')
    })

    it('should return empty string for falsy input', () => {
      expect(escapeHtml('')).toBe('')
      // @ts-expect-error Testing null input
      expect(escapeHtml(null)).toBe('')
      // @ts-expect-error Testing undefined input
      expect(escapeHtml(undefined)).toBe('')
    })

    it('should return empty string for non-string input', () => {
      // @ts-expect-error Testing number input
      expect(escapeHtml(123)).toBe('')
    })

    it('should preserve safe characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World')
      expect(escapeHtml('abc123')).toBe('abc123')
    })
  })

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<b>Bold</b> text')).toBe('Bold text')
    })

    it('should remove script tags and content', () => {
      expect(stripHtml('<script>evil()</script>text')).toBe('evil()text')
    })

    it('should normalize whitespace', () => {
      expect(stripHtml('  multiple   spaces  ')).toBe('multiple spaces')
    })

    it('should return empty string for falsy input', () => {
      expect(stripHtml('')).toBe('')
      // @ts-expect-error Testing null input
      expect(stripHtml(null)).toBe('')
    })

    it('should handle nested tags', () => {
      expect(stripHtml('<div><span>text</span></div>')).toBe('text')
    })
  })

  describe('sanitizeText', () => {
    it('should strip tags and escape remaining special characters', () => {
      const input = '<script>alert("xss")</script>'
      const result = sanitizeText(input)
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).toContain('&quot;')
    })

    it('should handle mixed content', () => {
      const input = '<b>Bold & "quoted"</b>'
      const result = sanitizeText(input)
      expect(result).toBe('Bold &amp; &quot;quoted&quot;')
    })

    it('should return empty string for falsy input', () => {
      expect(sanitizeText('')).toBe('')
      // @ts-expect-error Testing null input
      expect(sanitizeText(null)).toBe('')
    })
  })

  describe('sanitizeMultilineText', () => {
    it('should preserve newlines', () => {
      const input = 'Line 1\nLine 2\nLine 3'
      const result = sanitizeMultilineText(input)
      expect(result).toBe('Line 1\nLine 2\nLine 3')
    })

    it('should handle Windows-style newlines', () => {
      const input = 'Line 1\r\nLine 2'
      const result = sanitizeMultilineText(input)
      expect(result).toContain('Line 1')
      expect(result).toContain('Line 2')
    })

    it('should sanitize content while preserving newlines', () => {
      const input = '<b>Bold</b>\n<script>evil</script>'
      const result = sanitizeMultilineText(input)
      expect(result).not.toContain('<')
      expect(result).toContain('\n')
    })

    it('should return empty string for falsy input', () => {
      expect(sanitizeMultilineText('')).toBe('')
    })
  })

  describe('sanitizeUrl', () => {
    it('should allow https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/')
    })

    it('should allow http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com/')
    })

    it('should allow mailto URLs', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe(
        'mailto:test@example.com'
      )
    })

    it('should reject javascript URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('')
    })

    it('should reject data URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('')
    })

    it('should allow relative URLs starting with /', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page')
    })

    it('should reject protocol-relative URLs', () => {
      expect(sanitizeUrl('//evil.com/path')).toBe('')
    })

    it('should return empty string for invalid URLs', () => {
      expect(sanitizeUrl('not a url')).toBe('')
    })

    it('should return empty string for falsy input', () => {
      expect(sanitizeUrl('')).toBe('')
      // @ts-expect-error Testing null input
      expect(sanitizeUrl(null)).toBe('')
    })

    it('should trim whitespace', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe(
        'https://example.com/'
      )
    })
  })
})
