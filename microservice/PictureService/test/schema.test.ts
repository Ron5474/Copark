import 'reflect-metadata';
import { test, describe, it, expect} from 'vitest'
import { RecognizePlateInput, RecognizePlateResult } from '../src/picture/schema';

describe('RecognizePlateInput', () => {
  it('should create with required image field', () => {
    const input = new RecognizePlateInput();
    input.image = 'test-image-data';
    expect(input.image).toBe('test-image-data');
  });
});

describe('RecognizePlateResult', () => {
  it('should create with required fields', () => {
    const result = new RecognizePlateResult();
    result.plate = 'ABC123';
    result.state = 'CA';
    result.confidence = 0.98;

    expect(result.plate).toBe('ABC123');
    expect(result.state).toBe('CA');
    expect(result.confidence).toBeCloseTo(0.98);
  });
});