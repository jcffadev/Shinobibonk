param(
 [Parameter(Mandatory)][string]$InputPath,
 [Parameter(Mandatory)][string]$OutputPath,
 [int]$Columns=4,
 [int]$Rows=4,
 [int]$Cell=320
)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies @([Drawing.Bitmap].Assembly.Location,[Drawing.Rectangle].Assembly.Location,(Join-Path $PSHOME 'System.Private.Windows.GdiPlus.dll'),(Join-Path $PSHOME 'System.Private.Windows.Core.dll')) -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
public static class SpriteAtlas {
 public static void Pack(string input,string output,int columns,int rows,int cell) {
  if(columns<1||rows<1||cell<16)throw new ArgumentOutOfRangeException();
  using(var source=new Bitmap(input))
  using(var result=new Bitmap(columns*cell,rows*cell,PixelFormat.Format32bppArgb))
  using(var paint=Graphics.FromImage(result)) {
   var bounds=new Rectangle[columns*rows];
   var rowCuts=new int[rows+1];rowCuts[rows]=source.Height;
   for(int row=1;row<rows;row++) {
    int expected=row*source.Height/rows,span=source.Height/rows/6;
    int longest=0,start=-1;
    rowCuts[row]=expected;
    for(int y=expected-span;y<=expected+span;y++) {
     bool empty=true;
     for(int x=0;x<source.Width;x++)if(source.GetPixel(x,y).A>=141){empty=false;break;}
     if(empty) {
      if(start<0)start=y;
      if(y-start+1>longest){longest=y-start+1;rowCuts[row]=(start+y)/2;}
     } else start=-1;
    }
   }
   double scale=1;
   for(int row=0;row<rows;row++)for(int col=0;col<columns;col++) {
    int x0=col*source.Width/columns,x1=(col+1)*source.Width/columns;
    int y0=rowCuts[row],y1=rowCuts[row+1];
    for(int side=0;side<2;side++) {
     int boundary=col+side;
     if(boundary==0||boundary==columns)continue;
     int expected=boundary*source.Width/columns,span=source.Width/columns/6;
     int longest=0,start=-1,cut=expected;
     for(int x=expected-span;x<=expected+span;x++) {
      bool empty=true;
      for(int y=y0;y<y1;y++)if(source.GetPixel(x,y).A>=141){empty=false;break;}
      if(empty) {
       if(start<0)start=x;
       if(x-start+1>longest){longest=x-start+1;cut=(start+x)/2;}
      } else start=-1;
     }
     if(side==0)x0=cut;else x1=cut;
    }
    int left=x1,right=x0-1,top=y1,bottom=y0-1;
    for(int y=y0;y<y1;y++)for(int x=x0;x<x1;x++) {
     if(source.GetPixel(x,y).A<141)continue;
     left=Math.Min(left,x);right=Math.Max(right,x);top=Math.Min(top,y);bottom=Math.Max(bottom,y);
    }
    if(right<left||bottom<top||left==x0||right==x1-1||top==y0||bottom==y1-1)
     throw new InvalidOperationException("Empty or clipped sprite at "+row+","+col+" bounds "+left+","+top+","+right+","+bottom+" cell "+x0+","+y0+","+x1+","+y1);
    var rect=Rectangle.FromLTRB(left,top,right+1,bottom+1);
    bounds[row*columns+col]=rect;
    scale=Math.Min(scale,Math.Min((cell-30.0)/rect.Height,(cell-32.0)/rect.Width));
   }
   paint.InterpolationMode=InterpolationMode.NearestNeighbor;
   paint.PixelOffsetMode=PixelOffsetMode.Half;
   paint.CompositingMode=CompositingMode.SourceCopy;
   for(int i=0;i<bounds.Length;i++) {
    var rect=bounds[i];
    int width=(int)Math.Round(rect.Width*scale),height=(int)Math.Round(rect.Height*scale);
    paint.DrawImage(source,new Rectangle(i%columns*cell+(cell-width)/2,i/columns*cell+cell-15-height,width,height),rect,GraphicsUnit.Pixel);
   }
   result.Save(output,ImageFormat.Png);
  }
 }
}
'@
[SpriteAtlas]::Pack($InputPath,$OutputPath,$Columns,$Rows,$Cell)
