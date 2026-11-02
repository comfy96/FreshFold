What the documentation says
A key color is turned into a tonal palette that keeps its hue and chroma and varies only tone. The key color’s own lightness is not used.
Each palette has 13 tones: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100. The documentation does not describe a 14-color palette.
The newer surface roles (surface dim, bright, and the container levels) use extra neutral tones: 4, 6, 12, 17, 22, 24, 87, 92, 94, 96, 98. I got this list from the matugen release notes, which mirror the updated spec, not from the M3 site itself.
Error is a key color in M3. Warning and success are not roles in M3, so they are custom colors. I treated them the same way as the others.
Your 14-color palettes

The 14th color in every palette is tone 98. I added it because it is the first extra tone M3’s newer light surface roles need, and it keeps all palettes the same length.

Tone	Primary	Secondary	Tertiary	Neutral variant	Error	Warning	Success
0	
#000000	
#000000	
#000000	
#000000	
#000000	
#000000	
#000000
10	
#390C00	
#341103	
#370E00	
#251915	
#410002	
#2F1500	
#002109
20	
#5D1800	
#4E2514	
#53220D	
#3B2D29	
#690005	
#4D2600	
#003914
30	
#832600	
#693B28	
#6F3721	
#53433E	
#93000B	
#6E3900	
#005320
40	
#C2410C	
#85513E	
#8B4E36	
#6B5B55	
#BF0715	
#904D00	
#006E2D
50	
#D04B17	
#A16954	
#A8664C	
#85736D	
#E42C2A	
#B56100	
#008A3B
60	
#F26330	
#BE826C	
#C67F63	
#A08D86	
#FF544A	
#D97707	
#1CA64D
70	
#FF8B64	
#DC9C85	
#E5997B	
#BBA7A0	
#FF897E	
#FA9129	
#43C265
80	
#FFB59D	
#FAB79E	
#FFB599	
#D8C2BB	
#FFB4AB	
#FFB77D	
#62DF7D
90	
#FFDBD0	
#FFDBCE	
#FFDBCE	
#F5DED6	
#FFDAD6	
#FFDCC3	
#7FFC97
95	
#FFEDE8	
#FFEDE7	
#FFEDE7	
#FFEDE7	
#FFEDEA	
#FFEDE3	
#C5FFC8
98	
#FFF8F6	
#FFF8F6	
#FFF8F6	
#FFF8F6	
#FFF8F7	
#FFF8F5	
#EBFFE7
99	
#FFFBFF	
#FFFBFF	
#FFFBFF	
#FFFBFF	
#FFFBFF	
#FFFBFF	
#F6FFF1
100	
#FFFFFF	
#FFFFFF	
#FFFFFF	
#FFFFFF	
#FFFFFF	
#FFFFFF	
#FFFFFF
Neutral palette: 24 colors instead of 14

The neutral palette needs more than 14 colors because M3’s surface roles (surface dim, bright, and the container levels) pick tones that the 13-tone ramp doesn’t contain. Light surfaces use 87 to 98, and dark surfaces use 4 to 24.

Tones 0 to 24	Hex	Tones 30 to 100	Hex
0	
#000000	30	
#4F4441
4	
#140C0A	40	
#685C58
6	
#19120F	50	
#817470
10	
#221A17	60	
#9C8E89
12	
#261E1B	70	
#B7A8A4
17	
#312825	80	
#D3C3BE
20	
#382E2B	87	
#E7D7D2
22	
#3D332F	90	
#F0DFDA
24	
#413734	92	
#F6E5E0
		94	
#FBEAE5
		95	
#FEEDE8
		96	
#FFF1EC
		98	
#FFF8F6
		99	
#FFFBFF
		100	
#FFFFFF
Notes on your choices
Primary 40 override: 
#C2410C is HCT tone 46, so it is lighter than the tone 40 the algorithm would produce. Primary 40 and 50 (
#D04B17) are therefore close together. 
#C2410C on white is still about 5:1, which passes WCAG AA for normal text.
Warning and success: their key colors sit near tone 59, so their tone 40 values are much darker (
#904D00, 
#006E2D). That is correct behavior. Use the 40 tones for filled buttons with white text and the 90 tones for containers.
Secondary, tertiary and neutrals: I used only hue and chroma from your key colors. Tertiary 
#EDA082 is a light key color, so its palette is much darker at tone 40 than the swatch itself.
Hue: all your warm colors land at an HCT hue of about 37 to 40. Primary, secondary and tertiary will look related, and primary and warning (hue 58) are fairly close, so check that they stay distinguishable on screen.