import test from 'node:test'
import assert from 'node:assert/strict'
import { parseProposalItemsResponse } from '../../app/actions/ai-proposal'

test('parseProposalItemsResponse parses fenced json', () => {
  const parsed = parseProposalItemsResponse('```json\n[{"description":"Edit","quantity":1,"unitPrice":5000}]\n```')
  assert.equal(parsed.length, 1)
  assert.equal(parsed[0].description, 'Edit')
})

test('parseProposalItemsResponse validates invalid payload', () => {
  assert.throws(() => parseProposalItemsResponse('[{"description":"","quantity":0,"unitPrice":-1}]'))
})
