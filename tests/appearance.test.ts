import {it,expect} from 'vitest';
import {appearance,validateAppearance} from '../src/characters';
it('recolors a selected species independently of its identity',()=>{expect(appearance(1,8)).toMatchObject({name:'Frog',fill:'#ef6478'});expect(appearance(15,4)).toMatchObject({name:'Unicorn',fill:'#77c9ff'});});
it('preserves original colors for legacy racers without a color field',()=>{expect(appearance(0).fill).toBe('#ff905e');expect(appearance(2).fill).toBe('#b7a0ff');});
it('rejects unsupported or noninteger sprite and color selections',()=>{for(const [sprite,color]of [[16,0],[-1,0],[1.5,0],[1,12],[1,-1],[1,NaN],[NaN,1]])expect(()=>validateAppearance(sprite,color)).toThrow();expect(()=>validateAppearance(15,11)).not.toThrow();});
