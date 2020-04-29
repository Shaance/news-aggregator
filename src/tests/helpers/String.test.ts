import { clean, capitalize } from '../../helpers/String';

describe('String clean function', () => {
  it('should return empty if undefined', () => {
    const res = clean(undefined);
    expect(res).toBeFalsy();
  });

  it('should remove multiple spacces, new lines and ・ character', () => {
    const res = clean(' ds・dds   dsdds\n \n');
    expect(res).toEqual('dsdds dsdds');
  });
});

describe('String capitalize function', () => {
  it('should return empty if undefined', () => {
    const res = capitalize(undefined);
    expect(res).toBeFalsy();
  });

  it('should capitalize lol', () => {
    const res1 = capitalize('f');
    const res2 = capitalize('fff');
    expect(res1).toEqual('F');
    expect(res2).toEqual('Fff');
  });
});
