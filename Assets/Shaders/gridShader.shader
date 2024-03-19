Shader "Custom/gridShader"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)
		_GridSpacing("Grid Spacing", float) = 16
    }
    SubShader
    {
		Tags   { "RenderType" = "Transparent" "Queue" = "Transparent" }
        LOD 200
		Blend SrcAlpha OneMinusSrcAlpha
		//ZWrite Off
		Pass{

        CGPROGRAM
		#pragma vertex vert
		#pragma fragment frag
		#include "UnityCG.cginc"
		        
		struct appdata
		{
			float4 vertex : POSITION;
		};
		struct v2f
		{
			float4 vertex : SV_POSITION;
			float2 uv : TEXCOORD0;
			float3 worldPos : TEXCOORD1;
		};
		fixed4 _Color;
		float _GridSpacing;

		v2f vert(appdata_full v)
		{
			v2f o;
			o.vertex = UnityObjectToClipPos(v.vertex);
			//o.worldPos = mul(unity_ObjectToWorld, v.vertex);
			o.worldPos = v.vertex;
			o.uv = o.worldPos.xy * _GridSpacing;
			return o;
		}
		fixed4 frag(v2f i) : SV_Target
		{
			half4 param = _Color;
			float2 st = frac(i.uv);

			//suqare params, https://thebookofshaders.com/07/?lan=ru
			/*
			float2 bl = step( float2(0.1f, 0.1f), st );
			float2 tr = step( float2(.1f,.1f), float2(1.0f, 1.0f)-st);
			float pct = bl.x * bl.y * tr.x * tr.y;
			param.rgb = float3(pct,pct,pct);
			*/
			

			//blured, https://thebookofshaders.com/07/?lan=ru
			// https://thndl.com/square-shaped-shaders.html
			st = st *2.0f - 1.0f;
			float d = length(max(abs(st) - .45f, 0.5f));														// calculate distance
			float d1 = length(max(abs(float2(.1,.1)) - .45f, 0.5f));											// get color from centear at .1, for trimming this color

			//if (d>d1) {
			//	param = half4(frac(d*10.0f) + param.r, frac(d*10.0f) + param.g, frac(d*10.0f) + param.b, d*param.a);
			//} else {
			//	param = half4(1, 1, 1, 0.);
			//}
			param = half4(frac(d*10.0f) + param.r, frac(d*10.0f) + param.g, frac(d*10.0f) + param.b, (1.0-step(d, d1))*param.a );

			
			return param;
		}
        ENDCG

		}
	}
}