/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
 *
 * This program is freeware. You can redistribute it and/or modify it under the terms of the GNU 
 * General Public License (GPL) version 3 as published by the Free Software Foundation (https://www.gnu.org/copyleft/gpl.html). 
 * In accordance with Section 7(a) of the GNU GPL its Section 15 shall be amended to the effect that 
 * Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * THIS PROGRAM IS DISTRIBUTED WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR
 * FITNESS FOR A PARTICULAR PURPOSE. For more details, see GNU GPL at https://www.gnu.org/copyleft/gpl.html
 *
 * You can contact Ascensio System SIA by email at sales@onlyoffice.com
 *
 * The interactive user interfaces in modified source and object code versions of ONLYOFFICE must display 
 * Appropriate Legal Notices, as required under Section 5 of the GNU GPL version 3.
 *
 * Pursuant to Section 7  3(b) of the GNU GPL you must retain the original ONLYOFFICE logo which contains 
 * relevant author attributions when distributing the software. If the display of the logo in its graphic 
 * form is not reasonably feasible for technical reasons, you must include the words "Powered by ONLYOFFICE" 
 * in every copy of the program you distribute. 
 * Pursuant to Section 7  3(e) we decline to grant you any rights under trademark law for use of our trademarks.
 *
*/
"use strict";

(
/**
* @param {Window} window
* @param {undefined} undefined
*/
function (window, undefined) {

// Import
var c_oAscSizeRelFromH = AscCommon.c_oAscSizeRelFromH;
var c_oAscSizeRelFromV = AscCommon.c_oAscSizeRelFromV;

var checkNormalRotate = AscFormat.checkNormalRotate;
var HitInLine = AscFormat.HitInLine;
var MOVE_DELTA = AscFormat.MOVE_DELTA;

var c_oAscFill = Asc.c_oAscFill;

var BOUNDS_DELTA = 3;
function CheckObjectLine(obj)
{
    return (obj instanceof CShape && obj.spPr && obj.spPr.geometry && obj.spPr.geometry.preset === "line");
}


function CheckWordArtTextPr(oRun)
{
    var oTextPr = oRun.Get_CompiledPr()
    if(oTextPr.TextFill || oTextPr.TextOutline || (oTextPr.Unifill && oTextPr.Unifill.fill && (oTextPr.Unifill.fill.type !== c_oAscFill.FILL_TYPE_SOLID || oTextPr.Unifill.transparent != null && oTextPr.Unifill.transparent < 254.5)))
        return true;
    return false;
}

function hitToHandles(x, y, object)
{
    var invert_transform = object.getInvertTransform();
    var t_x, t_y;
    t_x = invert_transform.TransformPointX(x, y);
    t_y = invert_transform.TransformPointY(x, y);
    var radius = object.convertPixToMM(TRACK_CIRCLE_RADIUS);

    if(typeof global_mouseEvent !== "undefined" && isRealObject(global_mouseEvent) && AscFormat.isRealNumber(global_mouseEvent.KoefPixToMM))
    {
        radius *= global_mouseEvent.KoefPixToMM;
    }

    if (undefined !== window.AscHitToHandlesEpsilon)
    {
        radius = window.AscHitToHandlesEpsilon;
    }

    // чтобы не считать корни
    radius *= radius;

    // считаем ближайший маркер, так как окрестность может быть большой, и пересекаться.

    var _min_dist = 2 * radius; // главное что больше
    var _ret_value = -1;

    var check_line = CheckObjectLine(object);

    var sqr_x = t_x * t_x, sqr_y = t_y * t_y;
    var _tmp_dist = sqr_x + sqr_y;
    if (_tmp_dist < _min_dist)
    {
        _min_dist = _tmp_dist;
        _ret_value = 0;
    }

    var hc = object.extX * 0.5;
    var dist_x = t_x - hc;
    sqr_x = dist_x * dist_x;
    _tmp_dist = sqr_x + sqr_y;
    if (_tmp_dist < _min_dist && !check_line)
    {
        _min_dist = _tmp_dist;
        _ret_value = 1;
    }

    dist_x = t_x - object.extX;
    sqr_x = dist_x * dist_x;
    _tmp_dist = sqr_x + sqr_y;
    if (_tmp_dist < _min_dist && !check_line)
    {
        _min_dist = _tmp_dist;
        _ret_value = 2;
    }

    var vc = object.extY * 0.5;
    var dist_y = t_y - vc;
    sqr_y = dist_y * dist_y;
    _tmp_dist = sqr_x + sqr_y;
    if (_tmp_dist < _min_dist && !check_line)
    {
        _min_dist = _tmp_dist;
        _ret_value = 3;
    }

    dist_y = t_y - object.extY;
    sqr_y = dist_y * dist_y;
    _tmp_dist = sqr_x + sqr_y;
    if (_tmp_dist < _min_dist)
    {
        _min_dist = _tmp_dist;
        _ret_value = 4;
    }

    dist_x = t_x - hc;
    sqr_x = dist_x * dist_x;
    _tmp_dist = sqr_x + sqr_y;
    if (_tmp_dist < _min_dist && !check_line)
    {
        _min_dist = _tmp_dist;
        _ret_value = 5;
    }

    dist_x = t_x;
    sqr_x = dist_x * dist_x;
    _tmp_dist = sqr_x + sqr_y;
    if (_tmp_dist < _min_dist && !check_line)
    {
        _min_dist = _tmp_dist;
        _ret_value = 6;
    }

    dist_y = t_y - vc;
    sqr_y = dist_y * dist_y;
    _tmp_dist = sqr_x + sqr_y;
    if (_tmp_dist < _min_dist && !check_line)
    {
        _min_dist = _tmp_dist;
        _ret_value = 7;
    }

    if(object.canRotate && object.canRotate() && !check_line)
    {
        var rotate_distance = object.convertPixToMM(TRACK_DISTANCE_ROTATE);
        dist_y = t_y + rotate_distance;
        sqr_y = dist_y * dist_y;
        dist_x = t_x - hc;
        sqr_x = dist_x * dist_x;

        _tmp_dist = sqr_x + sqr_y;
        if (_tmp_dist < _min_dist)
        {
            _min_dist = _tmp_dist;
            _ret_value = 8;
        }
    }

    // теперь смотрим расстояние до центра фигуры, чтобы можно было двигать маленькую
    dist_x = t_x - hc;
    dist_y = t_y - vc;
    _tmp_dist =  dist_x * dist_x + dist_y * dist_y;
    if (_tmp_dist < _min_dist && !check_line)
    {
        _min_dist = _tmp_dist;
        _ret_value = -1;
    }

    if (_min_dist < radius)
        return _ret_value;

    return -1;
}

function CreateUniFillByUniColorCopy(uniColor)
{
    var ret = new AscFormat.CUniFill();
    ret.setFill(new AscFormat.CSolidFill());
    ret.fill.setColor(uniColor.createDuplicate());
    return ret;
}

function CreateUniFillByUniColor(uniColor)
{
    var ret = new AscFormat.CUniFill();
    ret.setFill(new AscFormat.CSolidFill());
    ret.fill.setColor(uniColor.createDuplicate());
    return ret;
}

function CopyRunToPPTX(Run, Paragraph, bHyper)
{
    var NewRun = new ParaRun(Paragraph, false);
    var RunPr = Run.Pr.Copy();
    if(RunPr.RStyle != undefined)
    {
        RunPr.RStyle = undefined;
    }

    if(bHyper)
    {
        if(!RunPr.Unifill)
        {
            RunPr.Unifill = AscFormat.CreateUniFillSchemeColorWidthTint(11, 0);
        }
        RunPr.Underline = true;
    }
    if(RunPr.TextFill)
    {
        RunPr.Unifill = RunPr.TextFill;
        RunPr.TextFill = undefined;
    }

    NewRun.Set_Pr( RunPr );

    var PosToAdd = 0;
    for ( var CurPos = 0; CurPos < Run.Content.length; CurPos++ )
    {
        var Item = Run.Content[CurPos];
        if ( para_End !== Item.Type && Item.Type !== para_Drawing && Item.Type !== para_Comment)
        {
            NewRun.Add_ToContent( PosToAdd, Item.Copy(), false );
            ++PosToAdd;
        }
    }
    return NewRun;
}

function ConvertParagraphToPPTX(paragraph, drawingDocument, newParent)
{
    var _drawing_document = isRealObject(drawingDocument) ? drawingDocument : paragraph.DrawingDocument;
    var _new_parent = isRealObject(newParent) ? newParent : paragraph.Parent;

    var new_paragraph = new Paragraph(_drawing_document, _new_parent, 0, 0, 0, 0, 0, true);
    if(!(paragraph instanceof Paragraph))
        return new_paragraph;
    var oCopyPr = paragraph.Pr.Copy();

    oCopyPr.ContextualSpacing = undefined;
    oCopyPr.KeepLines       = undefined;
    oCopyPr.KeepNext        = undefined;
    oCopyPr.PageBreakBefore = undefined;
    oCopyPr.Shd = undefined;
    oCopyPr.Brd.First = undefined;
    oCopyPr.Brd.Last  = undefined;
    oCopyPr.Brd.Between = undefined;
    oCopyPr.Brd.Bottom = undefined;
    oCopyPr.Brd.Left = undefined;
    oCopyPr.Brd.Right = undefined;
    oCopyPr.Brd.Top = undefined;
    oCopyPr.WidowControl = undefined;
    oCopyPr.Tabs = undefined;
    oCopyPr.NumPr = undefined;
    oCopyPr.PStyle = undefined;
    oCopyPr.FramePr = undefined;


    new_paragraph.Set_Pr(oCopyPr);
    var oNewEndPr = paragraph.TextPr.Value.Copy();
    if(oNewEndPr.TextFill)
    {
        oNewEndPr.Unifill = oNewEndPr.TextFill;
        oNewEndPr.TextFill = undefined;
    }
    new_paragraph.TextPr.Set_Value( oNewEndPr );
    new_paragraph.Internal_Content_Remove2(0, new_paragraph.Content.length);
    var Count = paragraph.Content.length;
    for ( var Index = 0; Index < Count; Index++ )
    {
        var Item = paragraph.Content[Index];
        if(Item.Type === para_Run)
        {
            new_paragraph.Internal_Content_Add(new_paragraph.Content.length, CopyRunToPPTX(Item, new_paragraph), false);
        }
        else if(Item.Type === para_Hyperlink)
        {
            new_paragraph.Internal_Content_Add(new_paragraph.Content.length, ConvertHyperlinkToPPTX(Item, new_paragraph), false);
        }
    }
    var EndRun = new ParaRun(new_paragraph);
    EndRun.Add_ToContent( 0, new ParaEnd() );
    new_paragraph.Internal_Content_Add( new_paragraph.Content.length, EndRun, false );
    return new_paragraph;
}

function ConvertHyperlinkToPPTX(hyperlink, paragraph)
{
    var hyperlink_ret = new ParaHyperlink(), i, item, pos = 0;
    hyperlink_ret.Set_Value( hyperlink.Value );
    hyperlink_ret.Set_ToolTip( hyperlink.ToolTip );
    for(i = 0; i < hyperlink.Content.length; ++i)
    {
        item = hyperlink.Content[i];
        if(item.Type === para_Run)
        {
            hyperlink_ret.Add_ToContent(pos++, CopyRunToPPTX(item, paragraph, true));
        }
        else if(item.Type === para_Hyperlink)
        {
            hyperlink_ret.Add_ToContent(pos++, ConvertHyperlinkToPPTX(item, paragraph));
        }
    }
    return hyperlink_ret;
}

function ConvertParagraphToWord(paragraph, docContent)
{
    var _docContent = isRealObject(docContent) ? docContent : paragraph.Parent;
    var oldFlag = paragraph.bFromDocument;
    paragraph.bFromDocument = true;
    var new_paragraph = paragraph.Copy(_docContent);
    CheckWordParagraphContent(new_paragraph.Content);
    var NewRPr = CheckWordRunPr(new_paragraph.TextPr.Value);
    if(NewRPr)
    {
        new_paragraph.TextPr.Apply_TextPr(NewRPr);
    }
    paragraph.bFromDocument = oldFlag;
    return new_paragraph;
}

function CheckWordRunPr(Pr)
{
    var NewRPr = null;
    if(Pr.Unifill && Pr.Unifill.fill )
    {
        switch(Pr.Unifill.fill.type)
        {
            case c_oAscFill.FILL_TYPE_SOLID:
            {
                if(Pr.Unifill.fill.color && Pr.Unifill.fill.color.color)
                {
                    switch(Pr.Unifill.fill.color.color.type)
                    {
                        case Asc.c_oAscColor.COLOR_TYPE_SCHEME:
                        {
                            if(Pr.Unifill.fill.color.Mods && Pr.Unifill.fill.color.Mods.Mods.length !== 0)
                            {
                                if(!Pr.Unifill.fill.color.canConvertPPTXModsToWord())
                                {
                                    NewRPr = Pr.Copy();
                                    NewRPr.TextFill = NewRPr.Unifill;
                                    NewRPr.Unifill = undefined;
                                }
                                else
                                {
                                    NewRPr = Pr.Copy();
                                    NewRPr.Unifill.convertToWordMods();
                                }
                            }
                            break;
                        }
                        case Asc.c_oAscColor.COLOR_TYPE_SRGB:
                        {

                            NewRPr = Pr.Copy();
                            var RGBA = Pr.Unifill.fill.color.color.RGBA;
                            NewRPr.Color = new CDocumentColor(RGBA.R, RGBA.G, RGBA.B);
                            NewRPr.Unifill = undefined;
                            break;
                        }
                        default:
                        {
                            NewRPr = Pr.Copy();
                            NewRPr.TextFill = NewRPr.Unifill;
                            NewRPr.Unifill = undefined;
                        }
                    }
                }
                break;
            }
            case c_oAscFill.FILL_TYPE_PATT:
            case c_oAscFill.FILL_TYPE_BLIP:
            {
                NewRPr = Pr.Copy();
                NewRPr.TextFill = AscFormat.CreateUnfilFromRGB(0, 0, 0);
                NewRPr.Unifill = undefined;
                break;
            }
            default :
            {
                NewRPr = Pr.Copy();
                NewRPr.TextFill = NewRPr.Unifill;
                NewRPr.Unifill = undefined;
                break;
            }
        }
    }
    return NewRPr;
}

function CheckWordParagraphContent(aContent)
{
    for(var i = 0; i < aContent.length; ++i)
    {
        var oItem = aContent[i];
        switch(oItem.Type)
        {
            case para_Run:
            {
                var NewRPr = CheckWordRunPr(oItem.Pr);
                if(NewRPr)
                {
                    oItem.Set_Pr(NewRPr);
                }
                break;
            }
            case para_Hyperlink:
            {
                CheckWordParagraphContent(oItem.Content);
                break;
            }
        }

    }
}
function RecalculateDocContentByMaxLine(oDocContent, dMaxWidth, bNeedRecalcAllDrawings)
{

    var max_width = 0, arr_content = oDocContent.Content, paragraph_lines, i, j;
    oDocContent.Reset(0, 0, dMaxWidth, 20000);
    if(bNeedRecalcAllDrawings)
    {
        var aAllDrawings = oDocContent.Get_AllDrawingObjects();
        for(i = 0; i < aAllDrawings.length; ++i)
        {
            aAllDrawings[i].GraphicObj.recalculate();
        }
    }
    oDocContent.Recalculate_Page(0, true);
    for(i = 0;  i < arr_content.length; ++i)
    {
        var oContentElement = arr_content[i];
        if(oContentElement.Get_Type() === type_Paragraph)
        {
            paragraph_lines = arr_content[i].Lines;
            for(j = 0;  j < paragraph_lines.length; ++j)
            {
                if(paragraph_lines[j].Ranges[0].W > max_width)
                    max_width = paragraph_lines[j].Ranges[0].W;
            }
        }
        else if(oContentElement.Get_Type() === type_Table)
        {

        }
    }
    if(max_width === 0)
    {
        if(oDocContent.Is_Empty())
        {
            if(oDocContent.Content[0] && oDocContent.Content[0].Content[0] && oDocContent.Content[0].Content[0].Content[0])
            {
                return oDocContent.Content[0].Content[0].Content[0].WidthVisible/TEXTWIDTH_DIVIDER;
            }
        }
        return 0.001;
    }
    return max_width;
}


function CheckExcelDrawingXfrm(xfrm)
{
    var rot = AscFormat.isRealNumber(xfrm.rot) ? xfrm.rot : 0;

    if (checkNormalRotate(rot))
    {
        if(xfrm.offX < 0)
        {
            xfrm.setOffX(0);
        }
        if(xfrm.offY < 0)
        {
            xfrm.setOffY(0);
        }
    }
    else
    {
        var dPosX = xfrm.offX + xfrm.extX/2 - xfrm.extY/2;
        var dPosY = xfrm.offY + xfrm.extY/2 - xfrm.extX/2;
        if(dPosX < 0)
        {
            xfrm.setOffX(xfrm.offX - dPosX);
        }
        if(dPosY < 0)
        {
            xfrm.setOffY(xfrm.offY - dPosY);
        }
    }
}


function SetXfrmFromMetrics(oDrawing, metrics)
{
    AscFormat.CheckSpPrXfrm(oDrawing);
    var rot = AscFormat.isRealNumber(oDrawing.spPr.xfrm.rot) ? normalizeRotate(oDrawing.spPr.xfrm.rot) : 0;

    var metricExtX, metricExtY;
    if(!(oDrawing instanceof AscFormat.CGroupShape))
    {
        metricExtX = metrics.extX;
        metricExtY = metrics.extY;
        if (checkNormalRotate(rot))
        {
            oDrawing.spPr.xfrm.setExtX(metrics.extX);
            oDrawing.spPr.xfrm.setExtY(metrics.extY);
        }
        else
        {
            oDrawing.spPr.xfrm.setExtX(metrics.extY);
            oDrawing.spPr.xfrm.setExtY(metrics.extX);
        }
    }
    else
    {
        if(AscFormat.isRealNumber(oDrawing.spPr.xfrm.extX) && AscFormat.isRealNumber(oDrawing.spPr.xfrm.extY))
        {
            metricExtX = oDrawing.spPr.xfrm.extX;
            metricExtY = oDrawing.spPr.xfrm.extY;
        }
        else
        {
            metricExtX = metrics.extX;
            metricExtY = metrics.extY;
        }
    }

    if (checkNormalRotate(rot))
    {
        oDrawing.spPr.xfrm.setOffX(metrics.x);
        oDrawing.spPr.xfrm.setOffY(metrics.y);
    }
    else
    {
        oDrawing.spPr.xfrm.setOffX(metrics.x + metricExtX/2 - metricExtY/2);
        oDrawing.spPr.xfrm.setOffY(metrics.y + metricExtY/2 - metricExtX/2);
    }
}

function CShape()
{
    this.nvSpPr         = null;
    this.spPr           = null;
    this.style          = null;
    this.txBody         = null;
    this.bodyPr			= null;
    this.textBoxContent = null;
    this.parent         = null;//В Word - ParaDrawing, в PowerPoint - Slide;
    this.group          = null;
    this.drawingBase    = null;//DrawingBase в Excell'е
    this.bWordShape     = null;//если этот флаг стоит в true то автофигура имеет формат как в редакторе документов
    this.bDeleted = true;
    this.bCheckAutoFitFlag = false;



    this.x = null;
    this.y = null;
    this.extX = null;
    this.extY = null;
    this.rot = null;
    this.flipH = null;
    this.flipV = null;
    this.transform = new CMatrix();
    this.invertTransform = null;
    this.transformText = new CMatrix();
    this.invertTransformText = null;
    this.brush  = null;
    this.pen = null;
    this.selected = false;


    this.snapArrayX = [];
    this.snapArrayY = [];

    this.localTransform = new CMatrix();
    this.localTransformText = new CMatrix();
    this.worksheet = null;
    this.cachedImage = null;

    this.txWarpStruct = null;
    this.txWarpStructParamarks = null;

    this.txWarpStructNoTransform = null;
    this.txWarpStructParamarksNoTransform = null;

    this.setRecalculateInfo();

    this.Lock = new AscCommon.CLock();
    this.Id = AscCommon.g_oIdCounter.Get_NewId();
    AscCommon.g_oTableId.Add( this, this.Id );
}

CShape.prototype =
{
    Get_Id: function () {
        return this.Id;
    },

    getObjectType: function () {
        return AscDFH.historyitem_type_Shape;
    },

    Write_ToBinary2: function (w) {
        w.WriteLong(AscDFH.historyitem_type_Shape);
        w.WriteString2(this.Id);
    },

    Read_FromBinary2: function (r) {
        this.Id = r.GetString2();
    },

    Get_AllDrawingObjects: function(DrawingObjects)
    {
        var oContent = this.getDocContent();
        if(oContent)
        {
            oContent.Get_AllDrawingObjects(DrawingObjects);
        }
    },

    convertToWord: function (document) {
        this.setBDeleted(true);
        var c = new CShape();
        c.setWordShape(true);
        c.setBDeleted(false);
        if (this.nvSpPr) {
            c.setNvSpPr(this.nvSpPr.createDuplicate());
        }
        if (this.spPr) {
            c.setSpPr(this.spPr.createDuplicate());
            c.spPr.setParent(c);
        }
        if (this.style) {
            c.setStyle(this.style.createDuplicate());
        }
        if (this.txBody) {
            if (this.txBody.bodyPr) {
                c.setBodyPr(this.txBody.bodyPr.createDuplicate());
            }
            if (this.txBody.content) {
                var new_content = new CDocumentContent(c, document.DrawingDocument, 0, 0, 0, 20000, false, false, false);
                var paragraphs = this.txBody.content.Content;

                new_content.Internal_Content_RemoveAll();
                for (var i = 0; i < paragraphs.length; ++i) {
                    var cur_par = paragraphs[i];
                    var new_paragraph = ConvertParagraphToWord(cur_par, new_content);
                    new_content.Internal_Content_Add(i, new_paragraph, false);
                    /*var bullet = cur_par.Pr.Bullet;
                     if(bullet && bullet.bulletType && bullet.bulletType.type !== AscFormat.BULLET_TYPE_BULLET_NONE)
                     {
                     switch(bullet.bulletType.type)
                     {
                     case AscFormat.BULLET_TYPE_BULLET_CHAR:
                     case AscFormat.BULLET_TYPE_BULLET_BLIP :
                     {
                     _bullet.m_nType = numbering_presentationnumfrmt_Char;
                     _bullet.m_sChar = _final_bullet.bulletType.Char[0];
                     _cur_paragraph.Add_PresentationNumbering(_bullet, true);
                     break;
                     }
                     case AscFormat.BULLET_TYPE_BULLET_AUTONUM :
                     {
                     _bullet.m_nType = g_NumberingArr[_final_bullet.bulletType.AutoNumType];
                     _bullet.m_nStartAt = _final_bullet.bulletType.startAt;
                     _cur_paragraph.Add_PresentationNumbering(_bullet, true);
                     break;
                     }
                     }
                     } */
                }
                c.setTextBoxContent(new_content);
            }
        }
        return c;
    },

    convertToPPTX: function (drawingDocument, worksheet) {
        var c = new CShape();
        c.setWordShape(false);
        c.setBDeleted(false);
        c.setWorksheet(worksheet);
        if (this.nvSpPr) {
            c.setNvSpPr(this.nvSpPr.createDuplicate());
        }
        if (this.spPr) {
            c.setSpPr(this.spPr.createDuplicate());
            c.spPr.setParent(c);
        }
        if (this.style) {
            c.setStyle(this.style.createDuplicate());
        }
        if (this.textBoxContent) {
            var tx_body = new AscFormat.CTextBody();
            tx_body.setParent(c);
            if (this.bodyPr) {
                tx_body.setBodyPr(this.bodyPr.createDuplicate());
            }
            var new_content = new CDocumentContent(tx_body, drawingDocument, 0, 0, 0, 0, false, false, true);
            new_content.Internal_Content_RemoveAll();
            var paragraphs = this.textBoxContent.Content;

            var index = 0;
            for (var i = 0; i < paragraphs.length; ++i) {
                var cur_par = paragraphs[i];
                if (cur_par instanceof Paragraph) {
                    var new_paragraph = ConvertParagraphToPPTX(cur_par, drawingDocument, new_content);
                    new_content.Internal_Content_Add(index++, new_paragraph, false);
                }
            }
            tx_body.setContent(new_content);
            c.setTxBody(tx_body);
        }
        return c;
    },

    documentGetAllFontNames: function (AllFonts) {
        //TODO
        var content = this.getDocContent();
        if (content) {
            content.Document_Get_AllFontNames(AllFonts);
        }
    },

    documentCreateFontMap: function (map) {
        var content = this.getDocContent();
        if (content) {
            content.Document_CreateFontMap(map);
        }
    },

    setBDeleted: function (pr) {
        History.Add(this, {Type: AscDFH.historyitem_ShapeSetBDeleted, oldPr: this.bDeleted, newPr: pr});
        this.bDeleted = pr;
    },

    setNvSpPr: function (pr) {
        History.Add(this, {Type: AscDFH.historyitem_ShapeSetNvSpPr, oldPr: this.nvSpPr, newPr: pr});
        this.nvSpPr = pr;
    },

    setSpPr: function (spPr) {
        History.Add(this, {Type: AscDFH.historyitem_ShapeSetSpPr, oldPr: this.spPr, newPr: spPr});
        this.spPr = spPr;
    },

    setStyle: function (style) {
        History.Add(this, {Type: AscDFH.historyitem_ShapeSetStyle, oldPr: this.style, newPr: style});
        this.style = style;
        var content = this.getDocContent();

        this.recalcInfo.recalculateShapeStyleForParagraph = true;
        if (this.recalcTextStyles)
            this.recalcTextStyles();
        if (content) {
            content.Recalc_AllParagraphs_CompiledPr();
        }
    },

    setTxBody: function (txBody) {
        History.Add(this, {Type: AscDFH.historyitem_ShapeSetTxBody, oldPr: this.txBody, newPr: txBody});
        this.txBody = txBody;
    },

    setTextBoxContent: function (textBoxContent) {
        History.Add(this, {
            Type: AscDFH.historyitem_ShapeSetTextBoxContent,
            oldPr: this.textBoxContent,
            newPr: textBoxContent
        });
        this.textBoxContent = textBoxContent;
    },

    setBodyPr: function (pr) {
        History.Add(this, {Type: AscDFH.historyitem_ShapeSetBodyPr, oldPr: this.bodyPr, newPr: pr});
        this.bodyPr = pr;
        this.recalcInfo.recalcContent = true;
        this.recalcInfo.recalcTransformText = true;
        this.addToRecalculate();
    },

    createTextBody: function () {
        var tx_body = new AscFormat.CTextBody();
        tx_body.setParent(this);
        tx_body.setContent(new CDocumentContent(tx_body, this.getDrawingDocument(), 0, 0, 0, 20000, false, false, true));
        tx_body.setBodyPr(new AscFormat.CBodyPr());
        tx_body.content.Content[0].Set_DocumentIndex(0);
        this.setTxBody(tx_body);
    },

    createTextBoxContent: function () {
        var body_pr = new AscFormat.CBodyPr();
        body_pr.setAnchor(1);
        this.setBodyPr(body_pr);
        this.setTextBoxContent(new CDocumentContent(this, this.getDrawingDocument(), 0, 0, 0, 20000, false, false));
        this.textBoxContent.Set_ParagraphAlign(AscCommon.align_Center);
        this.textBoxContent.Content[0].Set_DocumentIndex(0);
    },

    paragraphAdd: function (paraItem, bRecalculate) {
        var content_to_add = this.getDocContent();
        if (!content_to_add) {
            if (this.bWordShape) {
                this.createTextBoxContent();
            }
            else {
                this.createTextBody();
            }
            content_to_add = this.getDocContent();
        }
        if (content_to_add) {
            content_to_add.Paragraph_Add(paraItem, bRecalculate);
        }
    },

    applyTextFunction: function (docContentFunction, tableFunction, args)
    {
        var content_to_add = this.getDocContent();
        if (!content_to_add)
        {
            if (this.bWordShape)
            {
                this.createTextBoxContent();
            }
            else
            {
                this.createTextBody();
            }
            content_to_add = this.getDocContent();
            content_to_add.Cursor_MoveToStartPos();
        }
        if (content_to_add)
        {
            docContentFunction.apply(content_to_add, args);
        }
        if(!editor || !editor.noCreatePoint || editor.exucuteHistory)
        {
            this.checkExtentsByDocContent();
        }
    },

    clearContent: function () {
        var content = this.getDocContent();
        if (content) {
            content.Set_ApplyToAll(true);
            content.Remove(-1);
            content.Set_ApplyToAll(false);
        }
    },


    setBFromSerialize: function(bVal)
    {
        History.Add(this, {Type: AscDFH.historyitem_AutoShapes_SetBFromSerialize, oldPr: this.fromSerialize, newPr: bVal});
        this.fromSerialize = bVal;
    },

    deleteBFromSerialize: function()
    {
        if(this.fromSerialize)
        {
            this.setBFromSerialize(false);
            if(this.drawingBase)
            {
                var drawingObject = this.drawingBase;
                var metrics = drawingObject.getGraphicObjectMetrics();
                SetXfrmFromMetrics(this, metrics);
            }
        }
    },

    getDocContent: function () {
        if (this.txBody) {
            return this.txBody.content;
        }
        else if (this.textBoxContent) {
            return this.textBoxContent;
        }
        return null;
    },

    getBodyPr: function () {
        return AscFormat.ExecuteNoHistory(function () {

            if (this.bWordShape) {
                var ret = new AscFormat.CBodyPr();
                ret.setDefault();
                if (this.bodyPr)
                    ret.merge(this.bodyPr);
                return ret;
            }
            else {
                if (this.txBody && this.txBody.bodyPr)
                    return this.txBody.getCompiledBodyPr();
                var ret = new AscFormat.CBodyPr();
                ret.setDefault();
                return ret;
            }
        }, this, []);
    },

    Get_RevisionsChangeParagraph: function(SearchEngine){
        var oContent = this.getDocContent();
        if(oContent){
            oContent.Get_RevisionsChangeParagraph(SearchEngine);
        }
    },

    Search: function (Str, Props, SearchEngine, Type) {
        if (this.textBoxContent) {
            var dd = this.getDrawingDocument();
            dd.StartSearchTransform(this.transformText);
            this.textBoxContent.Search(Str, Props, SearchEngine, Type);
            dd.EndSearchTransform();
        }
        else if (this.txBody && this.txBody.content) {
            //var dd = this.getDrawingDocument();
            //dd.StartSearchTransform(this.transformText);
            this.txBody.content.Search(Str, Props, SearchEngine, Type);
            //dd.EndSearchTransform();
        }
    },

    Search_GetId: function (bNext, bCurrent) {
        if (this.textBoxContent)
            return this.textBoxContent.Search_GetId(bNext, bCurrent);

        else if (this.txBody && this.txBody.content) {
            return this.txBody.content.Search_GetId(bNext, bCurrent);
        }

        return null;
    },

    documentUpdateRulersState: function () {
        var content = this.getDocContent();
        if (!content)
            return;
        var xc, yc;
        var l, t, r, b;
        var body_pr = this.getBodyPr();
        var l_ins, t_ins, r_ins, b_ins;
        if (typeof body_pr.lIns === "number")
            l_ins = body_pr.lIns;
        else
            l_ins = 2.54;

        if (typeof body_pr.tIns === "number")
            t_ins = body_pr.tIns;
        else
            t_ins = 1.27;

        if (typeof body_pr.rIns === "number")
            r_ins = body_pr.rIns;
        else
            r_ins = 2.54;

        if (typeof body_pr.bIns === "number")
            b_ins = body_pr.bIns;
        else
            b_ins = 1.27;

        if (this.spPr && isRealObject(this.spPr.geometry) && isRealObject(this.spPr.geometry.rect)) {
            l = this.spPr.geometry.rect.l + l_ins;
            t = this.spPr.geometry.rect.t + t_ins;
            r = this.spPr.geometry.rect.r - r_ins;
            b = this.spPr.geometry.rect.b - b_ins;

        }
        else {
            l = l_ins;
            t = t_ins;
            r = this.extX - r_ins;
            b = this.extY - b_ins;
        }

        var x_lt, y_lt, x_rt, y_rt, x_rb, y_rb, x_lb, y_lb;
        var tr = this.transform;
        x_lt = tr.TransformPointX(l, t);
        y_lt = tr.TransformPointY(l, t);

        x_rb = tr.TransformPointX(r, b);
        y_rb = tr.TransformPointY(r, b);


        xc = (x_lt + x_rb) * 0.5;
        yc = (y_lt + y_rb) * 0.5;

        var hc = (r - l) * 0.5;
        var vc = (b - t) * 0.5;

        this.getDrawingDocument().Set_RulerState_Paragraph({L: xc - hc, T: yc - vc, R: xc + hc, B: yc + vc});
        content.Document_UpdateRulersState(AscFormat.isRealNumber(this.selectStartPage) ? this.selectStartPage : 0);
    },

    setParent: function (parent) {
        History.Add(this, {Type: AscDFH.historyitem_ShapeSetParent, oldPr: this.parent, newPr: parent});
        this.parent = parent;
    },

    setGroup: function (group) {
        History.Add(this, {Type: AscDFH.historyitem_ShapeSetGroup, oldPr: this.group, newPr: group});
        this.group = group;
    },

    getAllImages: function (images) {
        if (this.spPr && this.spPr.Fill && this.spPr.Fill.fill instanceof AscFormat.CBlipFill && typeof this.spPr.Fill.fill.RasterImageId === "string") {
            images[AscCommon.getFullImageSrc2(this.spPr.Fill.fill.RasterImageId)] = true;
        }
    },

    getAllFonts: function (fonts) {
        if (this.txBody) {
            this.txBody.content.Document_Get_AllFontNames(fonts);
            delete fonts["+mj-lt"];
            delete fonts["+mn-lt"];
            delete fonts["+mj-ea"];
            delete fonts["+mn-ea"];
            delete fonts["+mj-cs"];
            delete fonts["+mn-cs"];
        }
    },

    canFill: function () {
        if (this.spPr && this.spPr.geometry) {
            return this.spPr.geometry.canFill();
        }
        return true;
    },

    isShape: function () {
        return true;
    },

    isImage: function () {
        return false;
    },

    isChart: function () {
        return false;
    },

    isGroup: function () {
        return false;
    },

    getHierarchy: function () {
        //if (this.recalcInfo.recalculateShapeHierarchy)
        {
            this.compiledHierarchy = [];
            var hierarchy = this.compiledHierarchy;
            if (this.isPlaceholder()) {
                var ph_type = this.getPlaceholderType();
                var ph_index = this.getPlaceholderIndex();
                switch (this.parent.kind) {
                    case AscFormat.TYPE_KIND.SLIDE:
                    {
                        hierarchy.push(this.parent.Layout.getMatchingShape(ph_type, ph_index));
                        hierarchy.push(this.parent.Layout.Master.getMatchingShape(ph_type, ph_index));
                        break;
                    }

                    case AscFormat.TYPE_KIND.LAYOUT:
                    {
                        hierarchy.push(this.parent.Master.getMatchingShape(ph_type, ph_index));
                        break;
                    }
                }
            }
            this.recalcInfo.recalculateShapeHierarchy = true;
        }
        return this.compiledHierarchy;
    },

    getPaddings: function () {
        var paddings = null;
        var shape = this;
        var body_pr;
        if (shape.txBody) {
            body_pr = shape.txBody.bodyPr;
        }
        else if (shape.textBoxContent) {
            body_pr = shape.bodyPr;
        }
        if (body_pr) {
            paddings = new Asc.asc_CPaddings();
            if (typeof body_pr.lIns === "number")
                paddings.Left = body_pr.lIns;
            else
                paddings.Left = 2.54;

            if (typeof body_pr.tIns === "number")
                paddings.Top = body_pr.tIns;
            else
                paddings.Top = 1.27;

            if (typeof body_pr.rIns === "number")
                paddings.Right = body_pr.rIns;
            else
                paddings.Right = 2.54;

            if (typeof body_pr.bIns === "number")
                paddings.Bottom = body_pr.bIns;
            else
                paddings.Bottom = 1.27;
        }
        return paddings;
    },

    getCompiledFill: function () {
        if (this.recalcInfo.recalculateFill) {
            this.compiledFill = null;
            if (isRealObject(this.spPr) && isRealObject(this.spPr.Fill) && isRealObject(this.spPr.Fill.fill)) {
                if (this.spPr.Fill.fill instanceof AscFormat.CGradFill && this.spPr.Fill.fill.colors.length === 0) {
                    var parent_objects = this.getParentObjects();
                    var theme = parent_objects.theme;
                    var fmt_scheme = theme.themeElements.fmtScheme;
                    var fill_style_lst = fmt_scheme.fillStyleLst;
                    for (var i = fill_style_lst.length - 1; i > -1; --i) {
                        if (fill_style_lst[i] && fill_style_lst[i].fill instanceof AscFormat.CGradFill) {
                            this.spPr.Fill = fill_style_lst[i].createDuplicate();
                            break;
                        }
                    }
                }
                this.compiledFill = this.spPr.Fill.createDuplicate();
            }
            else if (isRealObject(this.group)) {
                var group_compiled_fill = this.group.getCompiledFill();
                if (isRealObject(group_compiled_fill) && isRealObject(group_compiled_fill.fill)) {
                    this.compiledFill = group_compiled_fill.createDuplicate();
                }
                else {
                    var hierarchy = this.getHierarchy();
                    for (var i = 0; i < hierarchy.length; ++i) {
                        if (isRealObject(hierarchy[i]) && isRealObject(hierarchy[i].spPr) && isRealObject(hierarchy[i].spPr.Fill) && isRealObject(hierarchy[i].spPr.Fill.fill)) {
                            this.compiledFill = hierarchy[i].spPr.Fill.createDuplicate();
                            break;
                        }
                    }
                }
            }
            else {
                var hierarchy = this.getHierarchy();
                for (var i = 0; i < hierarchy.length; ++i) {
                    if (isRealObject(hierarchy[i]) && isRealObject(hierarchy[i].spPr) && isRealObject(hierarchy[i].spPr.Fill) && isRealObject(hierarchy[i].spPr.Fill.fill)) {
                        this.compiledFill = hierarchy[i].spPr.Fill.createDuplicate();
                        break;
                    }
                }
            }
            this.recalcInfo.recalculateFill = false;
        }
        return this.compiledFill;
    },

    getMargins: function () {
        if (this.txBody) {
            return this.txBody.getMargins()
        }
        else {
            return null;
        }
    },
    Document_UpdateRulersState: function (margins) {
        if (this.txBody && this.txBody.content) {
            this.txBody.content.Document_UpdateRulersState(this.parent.num, this.getMargins());
        }
    },

    getCompiledLine: function () {
        if (this.recalcInfo.recalculateLine) {
            this.compiledLine = null;
            if (isRealObject(this.spPr) && isRealObject(this.spPr.ln) && isRealObject(this.spPr.ln)) {
                this.compiledLine = this.spPr.ln.createDuplicate();
            }
            else if (isRealObject(this.group)) {
                var group_compiled_line = this.group.getCompiledLine();
                if (isRealObject(group_compiled_line) && isRealObject(group_compiled_line.fill)) {
                    this.compiledLine = group_compiled_line.createDuplicate();
                }
                else {
                    var hierarchy = this.getHierarchy();
                    for (var i = 0; i < hierarchy.length; ++i) {
                        if (isRealObject(hierarchy[i]) && isRealObject(hierarchy[i].spPr) && isRealObject(hierarchy[i].spPr.ln)) {
                            this.compiledLine = hierarchy[i].spPr.ln.createDuplicate();
                            break;
                        }
                    }
                }
            }
            else {
                var hierarchy = this.getHierarchy();
                for (var i = 0; i < hierarchy.length; ++i) {
                    if (isRealObject(hierarchy[i]) && isRealObject(hierarchy[i].spPr) && isRealObject(hierarchy[i].spPr.ln)) {
                        this.compiledLine = hierarchy[i].spPr.ln.createDuplicate();
                        break;
                    }
                }
            }
            this.recalcInfo.recalculateLine = false;
        }
        return this.compiledLine;
    },

    getCompiledTransparent: function () {
        if (this.recalcInfo.recalculateTransparent) {
            this.compiledTransparent = null;
            if (isRealObject(this.spPr) && isRealObject(this.spPr.Fill) && AscFormat.isRealNumber(this.spPr.Fill.transparent))
                this.compiledTransparent = this.spPr.Fill.transparent;
            else if (isRealObject(this.group)) {
                var group_transparent = this.group.getCompiledTransparent();
                if (AscFormat.isRealNumber(group_transparent)) {
                    this.compiledTransparent = group_transparent;
                }
                else {
                    var hierarchy = this.getHierarchy();
                    for (var i = 0; i < hierarchy.length; ++i) {
                        if (isRealObject(hierarchy[i]) && isRealObject(hierarchy[i].spPr) && isRealObject(hierarchy[i].spPr.Fill) && AscFormat.isRealNumber(hierarchy[i].spPr.Fill.transparent)) {
                            this.compiledTransparent = hierarchy[i].spPr.Fill.transparent;
                            break;
                        }

                    }
                }
            }
            else {
                var hierarchy = this.getHierarchy();
                for (var i = 0; i < hierarchy.length; ++i) {
                    if (isRealObject(hierarchy[i]) && isRealObject(hierarchy[i].spPr) && isRealObject(hierarchy[i].spPr.Fill) && AscFormat.isRealNumber(hierarchy[i].spPr.Fill.transparent)) {
                        this.compiledTransparent = hierarchy[i].spPr.Fill.transparent;
                        break;
                    }

                }
            }
            this.recalcInfo.recalculateTransparent = false;
        }
        return this.compiledTransparent;
    },

    isPlaceholder: function () {
        return isRealObject(this.nvSpPr) && isRealObject(this.nvSpPr.nvPr) && isRealObject(this.nvSpPr.nvPr.ph);
    },

    getPlaceholderType: function () {
        return this.isPlaceholder() ? this.nvSpPr.nvPr.ph.type : null;
    },

    getPlaceholderIndex: function () {
        return this.isPlaceholder() ? this.nvSpPr.nvPr.ph.idx : null;
    },

    getPhType: function () {
        return this.isPlaceholder() ? this.nvSpPr.nvPr.ph.type : null;
    },

    getPhIndex: function () {
        return this.isPlaceholder() ? this.nvSpPr.nvPr.ph.idx : null;
    },

    setVerticalAlign: function (align) {
        var new_body_pr = this.getBodyPr();
        if (new_body_pr) {
            new_body_pr = new_body_pr.createDuplicate();
            new_body_pr.anchor = align;
            if (this.bWordShape) {
                this.setBodyPr(new_body_pr);
            }
            else {
                if (this.txBody) {
                    this.txBody.setBodyPr(new_body_pr);
                }
            }
        }
    },
    setVert: function (vert) {
        var new_body_pr = this.getBodyPr();
        if (new_body_pr) {
            new_body_pr = new_body_pr.createDuplicate();
            new_body_pr.vert = vert;
            if (this.bWordShape) {
                this.setBodyPr(new_body_pr);
            }
            else {
                if (this.txBody) {
                    this.txBody.setBodyPr(new_body_pr);
                }
            }
        }
        this.checkExtentsByDocContent && this.checkExtentsByDocContent();
    },

    setPaddings: function (paddings) {
        if (paddings) {

            var new_body_pr = this.getBodyPr();
            if (new_body_pr) {
                new_body_pr = new_body_pr.createDuplicate();
                if (AscFormat.isRealNumber(paddings.Left)) {
                    new_body_pr.lIns = paddings.Left;
                }

                if (AscFormat.isRealNumber(paddings.Top)) {
                    new_body_pr.tIns = paddings.Top;
                }

                if (AscFormat.isRealNumber(paddings.Right)) {
                    new_body_pr.rIns = paddings.Right;
                }
                if (AscFormat.isRealNumber(paddings.Bottom)) {
                    new_body_pr.bIns = paddings.Bottom;
                }

                if (this.bWordShape) {
                    this.setBodyPr(new_body_pr);
                }
                else {
                    if (this.txBody) {
                        this.txBody.setBodyPr(new_body_pr);
                    }
                }
            }
        }
    },

    recalculateTransformText: function () {

        var oContent = this.getDocContent();
        if (!oContent)
            return;

        var oBodyPr = this.getBodyPr();
        this.clipRect = this.checkTransformTextMatrix(this.localTransformText, oContent, oBodyPr, false);
        this.transformText = this.localTransformText.CreateDublicate();
        this.invertTransformText = global_MatrixTransformer.Invert(this.transformText);

        if (this.txBody && this.txBody.content2) {
            this.transformText2 = new CMatrix();
            this.clipRect2 = this.checkTransformTextMatrix(this.transformText2, this.txBody.content2, oBodyPr, false);
            this.invertTransformText2 = global_MatrixTransformer.Invert(this.transformText);
        }
        //if (oBodyPr.prstTxWarp) {
            var bNoTextNoShape = oBodyPr.prstTxWarp && oBodyPr.prstTxWarp.preset !== "textNoShape";
            /*if (this.bWordShape) {
                this.transformTextWordArt = this.transformText;
                this.invertTransformTextWordArt = this.invertTransformText;
            }
            else*/ {
                this.localTransformTextWordArt = new CMatrix();
                this.checkTransformTextMatrix(this.localTransformTextWordArt, oContent, oBodyPr, bNoTextNoShape, !this.bWordShape && bNoTextNoShape);
                this.transformTextWordArt = this.localTransformTextWordArt.CreateDublicate();
                this.invertTransformTextWordArt = global_MatrixTransformer.Invert(this.transformTextWordArt);
            }
            if (this.txBody && this.txBody.content2) {
                this.checkTransformTextMatrix(this.transformText2, this.txBody.content2, oBodyPr, bNoTextNoShape, !this.bWordShape && bNoTextNoShape);
                this.transformTextWordArt2 = new CMatrix();
                this.checkTransformTextMatrix(this.transformTextWordArt2, this.txBody.content2, oBodyPr, bNoTextNoShape, !this.bWordShape && bNoTextNoShape);
            }
       // }

        if (this.checkPosTransformText) {
            this.checkPosTransformText();
        }
        if (this.checkContentDrawings) {
            this.checkContentDrawings();
        }
    },

    getFullFlip: function () {
        var _transform = this.localTransform;
        var _full_rotate = this.getFullRotate();
        var _full_pos_x_lt = _transform.TransformPointX(0, 0);
        var _full_pos_y_lt = _transform.TransformPointY(0, 0);

        var _full_pos_x_rt = _transform.TransformPointX(this.extX, 0);
        var _full_pos_y_rt = _transform.TransformPointY(this.extX, 0);

        var _full_pos_x_rb = _transform.TransformPointX(this.extX, this.extY);
        var _full_pos_y_rb = _transform.TransformPointY(this.extX, this.extY);

        var _rotate_matrix = new CMatrix();
        global_MatrixTransformer.RotateRadAppend(_rotate_matrix, _full_rotate);

        var _rotated_pos_x_lt = _rotate_matrix.TransformPointX(_full_pos_x_lt, _full_pos_y_lt);

        var _rotated_pos_x_rt = _rotate_matrix.TransformPointX(_full_pos_x_rt, _full_pos_y_rt);
        var _rotated_pos_y_rt = _rotate_matrix.TransformPointY(_full_pos_x_rt, _full_pos_y_rt);

        var _rotated_pos_y_rb = _rotate_matrix.TransformPointY(_full_pos_x_rb, _full_pos_y_rb);
        return {
            flipH: _rotated_pos_x_lt > _rotated_pos_x_rt,
            flipV: _rotated_pos_y_rt > _rotated_pos_y_rb
        };
    },

    recalculateTransformText2: function () {
        if (this.txBody === null)
            return;
        if (!this.txBody.content2)
            return;
        this.transformText2 = new CMatrix();
        var _text_transform = this.transformText2;
        var _shape_transform = this.transform;
        var _body_pr = this.txBody.getBodyPr();
        var _content_height = this.txBody.getSummaryHeight2();
        var _l, _t, _r, _b;

        var _t_x_lt, _t_y_lt, _t_x_rt, _t_y_rt, _t_x_lb, _t_y_lb, _t_x_rb, _t_y_rb;
        if (this.spPr && isRealObject(this.spPr.geometry) && isRealObject(this.spPr.geometry.rect)) {
            var _rect = this.spPr.geometry.rect;
            _l = _rect.l + _body_pr.lIns;
            _t = _rect.t + _body_pr.tIns;
            _r = _rect.r - _body_pr.rIns;
            _b = _rect.b - _body_pr.bIns;
        }
        else {
            _l = _body_pr.lIns;
            _t = _body_pr.tIns;
            _r = this.extX - _body_pr.rIns;
            _b = this.extY - _body_pr.bIns;
        }

        if (_l >= _r) {
            var _c = (_l + _r) * 0.5;
            _l = _c - 0.01;
            _r = _c + 0.01;
        }

        if (_t >= _b) {
            _c = (_t + _b) * 0.5;
            _t = _c - 0.01;
            _b = _c + 0.01;
        }

        _t_x_lt = _shape_transform.TransformPointX(_l, _t);
        _t_y_lt = _shape_transform.TransformPointY(_l, _t);

        _t_x_rt = _shape_transform.TransformPointX(_r, _t);
        _t_y_rt = _shape_transform.TransformPointY(_r, _t);

        _t_x_lb = _shape_transform.TransformPointX(_l, _b);
        _t_y_lb = _shape_transform.TransformPointY(_l, _b);

        _t_x_rb = _shape_transform.TransformPointX(_r, _b);
        _t_y_rb = _shape_transform.TransformPointY(_r, _b);

        var _dx_t, _dy_t;
        _dx_t = _t_x_rt - _t_x_lt;
        _dy_t = _t_y_rt - _t_y_lt;

        var _dx_lt_rb, _dy_lt_rb;
        _dx_lt_rb = _t_x_rb - _t_x_lt;
        _dy_lt_rb = _t_y_rb - _t_y_lt;

        var _vertical_shift;
        var _text_rect_height = _b - _t;
        var _text_rect_width = _r - _l;
        if (!_body_pr.upright) {
            if (!(_body_pr.vert === AscFormat.nVertTTvert || _body_pr.vert === AscFormat.nVertTTvert270)) {
                if (/*_content_height < _text_rect_height*/true) {
                    switch (_body_pr.anchor) {
                        case 0: //b
                        { // (Text Anchor Enum ( Bottom ))
                            _vertical_shift = _text_rect_height - _content_height;
                            break;
                        }
                        case 1:    //ctr
                        {// (Text Anchor Enum ( Center ))
                            _vertical_shift = (_text_rect_height - _content_height) * 0.5;
                            break;
                        }
                        case 2: //dist
                        {// (Text Anchor Enum ( Distributed )) TODO: пока выравнивание  по центру. Переделать!
                            _vertical_shift = (_text_rect_height - _content_height) * 0.5;
                            break;
                        }
                        case 3: //just
                        {// (Text Anchor Enum ( Justified )) TODO: пока выравнивание  по центру. Переделать!
                            _vertical_shift = (_text_rect_height - _content_height) * 0.5;
                            break;
                        }
                        case 4: //t
                        {//Top
                            _vertical_shift = 0;
                            break;
                        }
                    }

                }
                else {
                    _vertical_shift = 0;

                    //_vertical_shift =  _text_rect_height - _content_height;
                    /*if(_body_pr.anchor === 0)
                     {
                     _vertical_shift =  _text_rect_height - _content_height;
                     }
                     else
                     {
                     _vertical_shift = 0;
                     } */
                }
                global_MatrixTransformer.TranslateAppend(_text_transform, 0, _vertical_shift);
                if (_dx_lt_rb * _dy_t - _dy_lt_rb * _dx_t <= 0) {
                    var alpha = Math.atan2(_dy_t, _dx_t);
                    global_MatrixTransformer.RotateRadAppend(_text_transform, -alpha);
                    global_MatrixTransformer.TranslateAppend(_text_transform, _t_x_lt, _t_y_lt);
                }
                else {
                    alpha = Math.atan2(_dy_t, _dx_t);
                    global_MatrixTransformer.RotateRadAppend(_text_transform, Math.PI - alpha);
                    global_MatrixTransformer.TranslateAppend(_text_transform, _t_x_rt, _t_y_rt);
                }
            }
            else {
                if (/*_content_height < _text_rect_width*/true) {
                    switch (_body_pr.anchor) {
                        case 0: //b
                        { // (Text Anchor Enum ( Bottom ))
                            _vertical_shift = _text_rect_width - _content_height;
                            break;
                        }
                        case 1:    //ctr
                        {// (Text Anchor Enum ( Center ))
                            _vertical_shift = (_text_rect_width - _content_height) * 0.5;
                            break;
                        }
                        case 2: //dist
                        {// (Text Anchor Enum ( Distributed ))
                            _vertical_shift = (_text_rect_width - _content_height) * 0.5;
                            break;
                        }
                        case 3: //just
                        {// (Text Anchor Enum ( Justified ))
                            _vertical_shift = (_text_rect_width - _content_height) * 0.5;
                            break;
                        }
                        case 4: //t
                        {//Top
                            _vertical_shift = 0;
                            break;
                        }
                    }
                }
                else {
                    _vertical_shift = 0;
                    /*if(_body_pr.anchor === 0)
                     {
                     _vertical_shift =  _text_rect_width - _content_height;
                     }
                     else
                     {
                     _vertical_shift = 0;
                     }  */
                }
                global_MatrixTransformer.TranslateAppend(_text_transform, 0, _vertical_shift);
                var _alpha;
                _alpha = Math.atan2(_dy_t, _dx_t);
                if (_body_pr.vert === AscFormat.nVertTTvert) {
                    if (_dx_lt_rb * _dy_t - _dy_lt_rb * _dx_t <= 0) {
                        global_MatrixTransformer.RotateRadAppend(_text_transform, -_alpha - Math.PI * 0.5);
                        global_MatrixTransformer.TranslateAppend(_text_transform, _t_x_rt, _t_y_rt);
                    }
                    else {
                        global_MatrixTransformer.RotateRadAppend(_text_transform, Math.PI * 0.5 - _alpha);
                        global_MatrixTransformer.TranslateAppend(_text_transform, _t_x_lt, _t_y_lt);
                    }
                }
                else {
                    if (_dx_lt_rb * _dy_t - _dy_lt_rb * _dx_t <= 0) {
                        global_MatrixTransformer.RotateRadAppend(_text_transform, -_alpha - Math.PI * 1.5);
                        global_MatrixTransformer.TranslateAppend(_text_transform, _t_x_lb, _t_y_lb);
                    }
                    else {
                        global_MatrixTransformer.RotateRadAppend(_text_transform, -Math.PI * 0.5 - _alpha);
                        global_MatrixTransformer.TranslateAppend(_text_transform, _t_x_rb, _t_y_rb);
                    }
                }
            }
            if (this.spPr && isRealObject(this.spPr.geometry) && isRealObject(this.spPr.geometry.rect)) {
                var rect = this.spPr.geometry.rect;
                this.clipRect = {x: -1, y: rect.t, w: this.extX + 2, h: rect.b - rect.t};
            }
            else {
                this.clipRect = {x: -1, y: 0, w: this.extX + 2, h: this.extY};
            }
        }
        else {
            var _full_rotate = this.getFullRotate();
            var _full_flip = this.getFullFlip();

            var _hc = this.extX * 0.5;
            var _vc = this.extY * 0.5;
            var _transformed_shape_xc = this.transform.TransformPointX(_hc, _vc);
            var _transformed_shape_yc = this.transform.TransformPointY(_hc, _vc);


            var _content_width, content_height2;
            if (checkNormalRotate(_full_rotate)) {
                if (!(_body_pr.vert === AscFormat.nVertTTvert || _body_pr.vert === AscFormat.nVertTTvert270)) {
                    _content_width = _r - _l;
                    content_height2 = _b - _t;
                }
                else {
                    _content_width = _b - _t;
                    content_height2 = _r - _l;
                }
            }
            else {
                if (!(_body_pr.vert === AscFormat.nVertTTvert || _body_pr.vert === AscFormat.nVertTTvert270)) {
                    _content_width = _b - _t;
                    content_height2 = _r - _l;

                }
                else {
                    _content_width = _r - _l;
                    content_height2 = _b - _t;
                }
            }

            if (/*_content_height < content_height2*/true) {
                switch (_body_pr.anchor) {
                    case 0: //b
                    { // (Text Anchor Enum ( Bottom ))
                        _vertical_shift = content_height2 - _content_height;
                        break;
                    }
                    case 1:    //ctr
                    {// (Text Anchor Enum ( Center ))
                        _vertical_shift = (content_height2 - _content_height) * 0.5;
                        break;
                    }
                    case 2: //dist
                    {// (Text Anchor Enum ( Distributed ))
                        _vertical_shift = (content_height2 - _content_height) * 0.5;
                        break;
                    }
                    case 3: //just
                    {// (Text Anchor Enum ( Justified ))
                        _vertical_shift = (content_height2 - _content_height) * 0.5;
                        break;
                    }
                    case 4: //t
                    {//Top
                        _vertical_shift = 0;
                        break;
                    }
                }
            }
            else {
                _vertical_shift = 0;
                /*if(_body_pr.anchor === 0)
                 {
                 _vertical_shift =  content_height2 - _content_height;
                 }
                 else
                 {
                 _vertical_shift = 0;
                 } */
            }

            var _text_rect_xc = _l + (_r - _l) * 0.5;
            var _text_rect_yc = _t + (_b - _t) * 0.5;

            var _vx = _text_rect_xc - _hc;
            var _vy = _text_rect_yc - _vc;

            var _transformed_text_xc, _transformed_text_yc;
            if (!_full_flip.flipH) {
                _transformed_text_xc = _transformed_shape_xc + _vx;
            }
            else {
                _transformed_text_xc = _transformed_shape_xc - _vx;
            }

            if (!_full_flip.flipV) {
                _transformed_text_yc = _transformed_shape_yc + _vy;
            }
            else {
                _transformed_text_yc = _transformed_shape_yc - _vy;
            }

            global_MatrixTransformer.TranslateAppend(_text_transform, 0, _vertical_shift);
            if (_body_pr.vert === AscFormat.nVertTTvert) {
                global_MatrixTransformer.TranslateAppend(_text_transform, -_content_width * 0.5, -content_height2 * 0.5);
                global_MatrixTransformer.RotateRadAppend(_text_transform, -Math.PI * 0.5);
                global_MatrixTransformer.TranslateAppend(_text_transform, _content_width * 0.5, content_height2 * 0.5);

            }
            if (_body_pr.vert === AscFormat.nVertTTvert270) {
                global_MatrixTransformer.TranslateAppend(_text_transform, -_content_width * 0.5, -content_height2 * 0.5);
                global_MatrixTransformer.RotateRadAppend(_text_transform, -Math.PI * 1.5);
                global_MatrixTransformer.TranslateAppend(_text_transform, _content_width * 0.5, content_height2 * 0.5);
            }
            global_MatrixTransformer.TranslateAppend(_text_transform, _transformed_text_xc - _content_width * 0.5, _transformed_text_yc - content_height2 * 0.5);

            var body_pr = this.bodyPr;
            var l_ins = typeof body_pr.lIns === "number" ? body_pr.lIns : 2.54;
            var t_ins = typeof body_pr.tIns === "number" ? body_pr.tIns : 1.27;
            var r_ins = typeof body_pr.rIns === "number" ? body_pr.rIns : 2.54;
            var b_ins = typeof body_pr.bIns === "number" ? body_pr.bIns : 1.27;
            this.clipRect = {
                x: -1,
                y: -_vertical_shift - t_ins,
                w: Math.max(this.extX, this.extY) + 2,
                h: this.contentHeight + (b_ins + t_ins)
            };
        }
        this.invertTransformText2 = global_MatrixTransformer.Invert(this.transformText2);
    },

    getTextRect: function () {
        return this.spPr && this.spPr.geometry && this.spPr.geometry.rect ? this.spPr.geometry.rect : {
            l: 0,
            t: 0,
            r: this.extX,
            b: this.extY
        };
    },

    checkTransformTextMatrix: function (oMatrix, oContent, oBodyPr, bWordArtTransform, bIgnoreInsets) {
        oMatrix.Reset();
        var _shape_transform = this.localTransform;
        var _content_height = oContent.Get_SummaryHeight();
        var _l, _t, _r, _b;
        var _t_x_lt, _t_y_lt, _t_x_rt, _t_y_rt, _t_x_lb, _t_y_lb, _t_x_rb, _t_y_rb;
        var oRect = this.getTextRect();
        var l_ins = bIgnoreInsets ? 0 : (AscFormat.isRealNumber(oBodyPr.lIns) ? oBodyPr.lIns : 2.54);
        var t_ins = bIgnoreInsets ? 0 : (AscFormat.isRealNumber(oBodyPr.tIns) ? oBodyPr.tIns : 1.27);
        var r_ins = bIgnoreInsets ? 0 : (AscFormat.isRealNumber(oBodyPr.rIns) ? oBodyPr.rIns : 2.54);
        var b_ins = bIgnoreInsets ? 0 : (AscFormat.isRealNumber(oBodyPr.bIns) ? oBodyPr.bIns : 1.27);
        _l = oRect.l + l_ins;
        _t = oRect.t + t_ins;
        _r = oRect.r - r_ins;
        _b = oRect.b - b_ins;

        if (_l >= _r) {
            var _c = (_l + _r) * 0.5;
            _l = _c - 0.01;
            _r = _c + 0.01;
        }

        if (_t >= _b) {
            _c = (_t + _b) * 0.5;
            _t = _c - 0.01;
            _b = _c + 0.01;
        }
        _t_x_lt = _shape_transform.TransformPointX(_l, _t);
        _t_y_lt = _shape_transform.TransformPointY(_l, _t);

        _t_x_rt = _shape_transform.TransformPointX(_r, _t);
        _t_y_rt = _shape_transform.TransformPointY(_r, _t);

        _t_x_lb = _shape_transform.TransformPointX(_l, _b);
        _t_y_lb = _shape_transform.TransformPointY(_l, _b);

        _t_x_rb = _shape_transform.TransformPointX(_r, _b);
        _t_y_rb = _shape_transform.TransformPointY(_r, _b);

        var _dx_t, _dy_t;
        _dx_t = _t_x_rt - _t_x_lt;
        _dy_t = _t_y_rt - _t_y_lt;

        var _dx_lt_rb, _dy_lt_rb;
        _dx_lt_rb = _t_x_rb - _t_x_lt;
        _dy_lt_rb = _t_y_rb - _t_y_lt;

        var _vertical_shift;
        var _text_rect_height = _b - _t;
        var _text_rect_width = _r - _l;
        var oClipRect;
        if (!oBodyPr.upright) {
            if (!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270)) {
                if (bWordArtTransform) {
                    _vertical_shift = 0;
                }
                else {
                    if (!(this.bWordShape || this.worksheet ) || _content_height < _text_rect_height) {
                        switch (oBodyPr.anchor) {
                            case 0: //b
                            { // (Text Anchor Enum ( Bottom ))
                                _vertical_shift = _text_rect_height - _content_height;
                                break;
                            }
                            case 1:    //ctr
                            {// (Text Anchor Enum ( Center ))
                                _vertical_shift = (_text_rect_height - _content_height) * 0.5;
                                break;
                            }
                            case 2: //dist
                            {// (Text Anchor Enum ( Distributed )) TODO: пока выравнивание  по центру. Переделать!
                                _vertical_shift = (_text_rect_height - _content_height) * 0.5;
                                break;
                            }
                            case 3: //just
                            {// (Text Anchor Enum ( Justified )) TODO: пока выравнивание  по центру. Переделать!
                                _vertical_shift = (_text_rect_height - _content_height) * 0.5;
                                break;
                            }
                            case 4: //t
                            {//Top
                                _vertical_shift = 0;
                                break;
                            }
                        }
                    }
                    else {
                        _vertical_shift = _text_rect_height - _content_height;
                        if (oBodyPr.anchor === 0) {
                            _vertical_shift = _text_rect_height - _content_height;
                        }
                        else {
                            _vertical_shift = 0;
                        }
                    }
                }
                global_MatrixTransformer.TranslateAppend(oMatrix, 0, _vertical_shift);
                if (_dx_lt_rb * _dy_t - _dy_lt_rb * _dx_t <= 0) {
                    var alpha = Math.atan2(_dy_t, _dx_t);
                    global_MatrixTransformer.RotateRadAppend(oMatrix, -alpha);
                    global_MatrixTransformer.TranslateAppend(oMatrix, _t_x_lt, _t_y_lt);
                }
                else {
                    alpha = Math.atan2(_dy_t, _dx_t);
                    global_MatrixTransformer.RotateRadAppend(oMatrix, Math.PI - alpha);
                    global_MatrixTransformer.TranslateAppend(oMatrix, _t_x_rt, _t_y_rt);
                }
            }
            else {
                if (bWordArtTransform) {
                    _vertical_shift = 0;
                }
                else {
                    if (!(this.bWordShape || this.worksheet) || _content_height < _text_rect_width) {
                        switch (oBodyPr.anchor) {
                            case 0: //b
                            { // (Text Anchor Enum ( Bottom ))
                                _vertical_shift = _text_rect_width - _content_height;
                                break;
                            }
                            case 1:    //ctr
                            {// (Text Anchor Enum ( Center ))
                                _vertical_shift = (_text_rect_width - _content_height) * 0.5;
                                break;
                            }
                            case 2: //dist
                            {// (Text Anchor Enum ( Distributed ))
                                _vertical_shift = (_text_rect_width - _content_height) * 0.5;
                                break;
                            }
                            case 3: //just
                            {// (Text Anchor Enum ( Justified ))
                                _vertical_shift = (_text_rect_width - _content_height) * 0.5;
                                break;
                            }
                            case 4: //t
                            {//Top
                                _vertical_shift = 0;
                                break;
                            }
                        }
                    }
                    else {
                        if (oBodyPr.anchor === 0) {
                            _vertical_shift = _text_rect_width - _content_height;
                        }
                        else {
                            _vertical_shift = 0;
                        }
                    }
                }
                global_MatrixTransformer.TranslateAppend(oMatrix, 0, _vertical_shift);
                var _alpha;
                _alpha = Math.atan2(_dy_t, _dx_t);
                if (oBodyPr.vert === AscFormat.nVertTTvert) {
                    if (_dx_lt_rb * _dy_t - _dy_lt_rb * _dx_t <= 0) {
                        global_MatrixTransformer.RotateRadAppend(oMatrix, -_alpha - Math.PI * 0.5);
                        global_MatrixTransformer.TranslateAppend(oMatrix, _t_x_rt, _t_y_rt);
                    }
                    else {
                        global_MatrixTransformer.RotateRadAppend(oMatrix, Math.PI * 0.5 - _alpha);
                        global_MatrixTransformer.TranslateAppend(oMatrix, _t_x_lt, _t_y_lt);
                    }
                }
                else {
                    if (_dx_lt_rb * _dy_t - _dy_lt_rb * _dx_t <= 0) {
                        global_MatrixTransformer.RotateRadAppend(oMatrix, -_alpha - Math.PI * 1.5);
                        global_MatrixTransformer.TranslateAppend(oMatrix, _t_x_lb, _t_y_lb);
                    }
                    else {
                        global_MatrixTransformer.RotateRadAppend(oMatrix, -Math.PI * 0.5 - _alpha);
                        global_MatrixTransformer.TranslateAppend(oMatrix, _t_x_rb, _t_y_rb);
                    }
                }
            }
            if (this.spPr && isRealObject(this.spPr.geometry) && isRealObject(this.spPr.geometry.rect)) {
                var rect = this.spPr.geometry.rect;
                var Diff = 1.6;
                var clipW = rect.r - rect.l + Diff;
                if(clipW <= 0)
                {
                    clipW = 0.01;
                }
                var clipH = rect.b - rect.t + Diff - b_ins - t_ins;
                if(clipH < 0)
                {
                    clipH = 0.01;
                }
                oClipRect = {x: rect.l - Diff, y: rect.t - Diff + t_ins, w: clipW, h: clipH};
            }
            else {
                oClipRect = {x: -1.6, y: t_ins, w: this.extX + 3.2, h: this.extY - b_ins};
            }
        }
        else {
            var _full_rotate = this.getFullRotate();
            var _full_flip = this.getFullFlip();

            var _hc = this.extX * 0.5;
            var _vc = this.extY * 0.5;
            var _transformed_shape_xc = this.localTransform.TransformPointX(_hc, _vc);
            var _transformed_shape_yc = this.localTransform.TransformPointY(_hc, _vc);


            var _content_width, content_height2;
            if (checkNormalRotate(_full_rotate)) {
                if (!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270)) {
                    _content_width = _r - _l;
                    content_height2 = _b - _t;
                }
                else {
                    _content_width = _b - _t;
                    content_height2 = _r - _l;
                }
            }
            else {
                if (!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270)) {
                    _content_width = _b - _t;
                    content_height2 = _r - _l;

                }
                else {
                    _content_width = _r - _l;
                    content_height2 = _b - _t;
                }
            }

            if (bWordArtTransform) {
                _vertical_shift = 0;
            }
            else {
                if (!(this.bWordShape || this.worksheet) || _content_height < content_height2) {
                    switch (oBodyPr.anchor) {
                        case 0: //b
                        { // (Text Anchor Enum ( Bottom ))
                            _vertical_shift = content_height2 - _content_height;
                            break;
                        }
                        case 1:    //ctr
                        {// (Text Anchor Enum ( Center ))
                            _vertical_shift = (content_height2 - _content_height) * 0.5;
                            break;
                        }
                        case 2: //dist
                        {// (Text Anchor Enum ( Distributed ))
                            _vertical_shift = (content_height2 - _content_height) * 0.5;
                            break;
                        }
                        case 3: //just
                        {// (Text Anchor Enum ( Justified ))
                            _vertical_shift = (content_height2 - _content_height) * 0.5;
                            break;
                        }
                        case 4: //t
                        {//Top
                            _vertical_shift = 0;
                            break;
                        }
                    }
                }
                else {
                    if (oBodyPr.anchor === 0) {
                        _vertical_shift = content_height2 - _content_height;
                    }
                    else {
                        _vertical_shift = 0;
                    }
                }

            }

            var _text_rect_xc = _l + (_r - _l) * 0.5;
            var _text_rect_yc = _t + (_b - _t) * 0.5;

            var _vx = _text_rect_xc - _hc;
            var _vy = _text_rect_yc - _vc;

            var _transformed_text_xc, _transformed_text_yc;
            if (!_full_flip.flipH) {
                _transformed_text_xc = _transformed_shape_xc + _vx;
            }
            else {
                _transformed_text_xc = _transformed_shape_xc - _vx;
            }

            if (!_full_flip.flipV) {
                _transformed_text_yc = _transformed_shape_yc + _vy;
            }
            else {
                _transformed_text_yc = _transformed_shape_yc - _vy;
            }

            global_MatrixTransformer.TranslateAppend(oMatrix, 0, _vertical_shift);
            if (oBodyPr.vert === AscFormat.nVertTTvert) {
                global_MatrixTransformer.TranslateAppend(oMatrix, -_content_width * 0.5, -content_height2 * 0.5);
                global_MatrixTransformer.RotateRadAppend(oMatrix, -Math.PI * 0.5);
                global_MatrixTransformer.TranslateAppend(oMatrix, _content_width * 0.5, content_height2 * 0.5);

            }
            if (oBodyPr.vert === AscFormat.nVertTTvert270) {
                global_MatrixTransformer.TranslateAppend(oMatrix, -_content_width * 0.5, -content_height2 * 0.5);
                global_MatrixTransformer.RotateRadAppend(oMatrix, -Math.PI * 1.5);
                global_MatrixTransformer.TranslateAppend(oMatrix, _content_width * 0.5, content_height2 * 0.5);
            }
            global_MatrixTransformer.TranslateAppend(oMatrix, _transformed_text_xc - _content_width * 0.5, _transformed_text_yc - content_height2 * 0.5);

            var Diff = 1.6;
            var clipW = oRect.r - oRect.l + Diff - l_ins - r_ins;
            if(clipW <= 0)
            {
                clipW = 0.01;
            }
            var clipH = oRect.b - oRect.t + Diff - b_ins - t_ins;
            if(clipH < 0)
            {
                clipH = 0.01;
            }
            oClipRect = {x: oRect.l + l_ins - Diff, y: oRect.t - Diff + t_ins, w: clipW, h: clipH};
        }
        return oClipRect;
    },

    setWordShape: function (pr) {
        History.Add(this, {Type: AscDFH.historyitem_ShapeSetWordShape, oldPr: this.bWordShape, newPr: pr});
        this.bWordShape = pr;
    },

    selectionCheck: function (X, Y, Page_Abs, NearPos) {

        var content = this.getDocContent();
        if (content) {
            if (undefined !== NearPos)
                return content.Selection_Check(X, Y, Page_Abs, NearPos);

            if (isRealObject(content) && this.hitInTextRect(X, Y) && this.invertTransformText) {
                var t_x = this.invertTransformText.TransformPointX(X, Y);
                var t_y = this.invertTransformText.TransformPointY(X, Y);
                return content.Selection_Check(t_x, t_y, Page_Abs, NearPos);
            }
        }
        return false;
    },

    copy: function () {
        var copy = new CShape();
        if (this.nvSpPr)
            copy.setNvSpPr(this.nvSpPr.createDuplicate());
        if (this.spPr) {
            copy.setSpPr(this.spPr.createDuplicate());
            copy.spPr.setParent(copy);
        }
        if (this.style) {
            copy.setStyle(this.style.createDuplicate());
        }
        if (this.txBody) {
            copy.setTxBody(this.txBody.createDuplicate());
            copy.txBody.setParent(copy);
        }
        if (this.bodyPr) {
            copy.setBodyPr(this.bodyPr.createDuplicate());
        }
        if (this.textBoxContent) {
            copy.setTextBoxContent(this.textBoxContent.Copy(copy));
        }
        copy.setWordShape(this.bWordShape);
        copy.setBDeleted(this.bDeleted);
        if(this.fromSerialize)
        {
            copy.setBFromSerialize(true);
        }
        copy.cachedImage = this.getBase64Img();
        copy.cachedPixH = this.cachedPixH;
        copy.cachedPixW = this.cachedPixW;
        return copy;
    },

    Get_Styles: function (level) {

        var _level = AscFormat.isRealNumber(level) ? level : 0;
        if (this.recalcInfo.recalculateTextStyles[_level]) {
            this.recalculateTextStyles(_level);
            this.recalcInfo.recalculateTextStyles[_level] = false;
        }
        this.recalcInfo.recalculateTextStyles[_level] = true;
        var ret = this.compiledStyles[_level];
        this.compiledStyles[_level] = undefined;
        return ret;
        //   return this.compiledStyles[_level];
    },


    recalculateTextStyles: function (level) {
        return AscFormat.ExecuteNoHistory(function () {
            var parent_objects = this.getParentObjects();
            var default_style = new CStyle("defaultStyle", null, null, null, true);
            default_style.ParaPr.Spacing.LineRule = Asc.linerule_Auto;
            default_style.ParaPr.Spacing.Line = 1;
            default_style.ParaPr.Spacing.Before = 0;
            default_style.ParaPr.Spacing.After = 0;
            default_style.ParaPr.Align = AscCommon.align_Center;
            if(parent_objects.theme)
            {
                default_style.TextPr.RFonts.Ascii = {Name: "+mn-lt", Index: -1};
                default_style.TextPr.RFonts.EastAsia = {Name: "+mn-ea", Index: -1};
                default_style.TextPr.RFonts.CS = {Name: "+mn-cs", Index: -1};
                default_style.TextPr.RFonts.HAnsi = {Name: "+mn-lt", Index: -1};
            }
            if (isRealObject(parent_objects.presentation) && isRealObject(parent_objects.presentation.defaultTextStyle)
                && isRealObject(parent_objects.presentation.defaultTextStyle.levels[level])) {
                var default_ppt_style = parent_objects.presentation.defaultTextStyle.levels[level];
                default_style.ParaPr.Merge(default_ppt_style.Copy());
                default_ppt_style.DefaultRunPr && default_style.TextPr.Merge(default_ppt_style.DefaultRunPr.Copy());
            }

            var master_style;
            if (isRealObject(parent_objects.master) && isRealObject(parent_objects.master.txStyles)) {
                var master_ppt_styles;
                master_style = new CStyle("masterStyle", null, null, null, true);
                if (this.isPlaceholder()) {
                    switch (this.getPlaceholderType()) {
                        case AscFormat.phType_ctrTitle:
                        case AscFormat.phType_title:
                        {
                            master_ppt_styles = parent_objects.master.txStyles.titleStyle;
                            break;
                        }
                        case AscFormat.phType_body:
                        case AscFormat.phType_subTitle:
                        case AscFormat.phType_obj:
                        case null:
                        {
                            master_ppt_styles = parent_objects.master.txStyles.bodyStyle;
                            break;
                        }
                        default:
                        {
                            master_ppt_styles = parent_objects.master.txStyles.otherStyle;
                            break;
                        }
                    }
                }
                else {
                    master_ppt_styles = parent_objects.master.txStyles.otherStyle;
                }

                if (isRealObject(master_ppt_styles) && isRealObject(master_ppt_styles.levels) && isRealObject(master_ppt_styles.levels[level])) {
                    var master_ppt_style = master_ppt_styles.levels[level];
                    master_style.ParaPr = master_ppt_style.Copy();
                    if (master_ppt_style.DefaultRunPr) {
                        master_style.TextPr = master_ppt_style.DefaultRunPr.Copy();
                    }
                }
            }

            var hierarchy = this.getHierarchy();
            var hierarchy_styles = [];
            for (var i = 0; i < hierarchy.length; ++i) {
                var hierarchy_shape = hierarchy[i];
                if (isRealObject(hierarchy_shape)
                    && isRealObject(hierarchy_shape.txBody)
                    && isRealObject(hierarchy_shape.txBody.lstStyle)
                    && isRealObject(hierarchy_shape.txBody.lstStyle.levels)
                    && isRealObject(hierarchy_shape.txBody.lstStyle.levels[level])) {
                    var hierarchy_ppt_style = hierarchy_shape.txBody.lstStyle.levels[level];
                    var hierarchy_style = new CStyle("hierarchyStyle" + i, null, null, null, true);
                    hierarchy_style.ParaPr = hierarchy_ppt_style.Copy();
                    if (hierarchy_ppt_style.DefaultRunPr) {
                        hierarchy_style.TextPr = hierarchy_ppt_style.DefaultRunPr.Copy();
                    }
                    hierarchy_styles.push(hierarchy_style);
                }
            }

            var ownStyle;
            if (isRealObject(this.txBody) && isRealObject(this.txBody.lstStyle) && isRealObject(this.txBody.lstStyle.levels[level])) {
                ownStyle = new CStyle("ownStyle", null, null, null, true);
                var own_ppt_style = this.txBody.lstStyle.levels[level];
                ownStyle.ParaPr = own_ppt_style.Copy();
                if (own_ppt_style.DefaultRunPr) {
                    ownStyle.TextPr = own_ppt_style.DefaultRunPr.Copy();
                }
                hierarchy_styles.splice(0, 0, ownStyle);
            }
            var shape_text_style;
            if (isRealObject(this.style) && isRealObject(this.style.fontRef)) {
                shape_text_style = new CStyle("shapeTextStyle", null, null, null, true);
                var first_name;
                if (this.style.fontRef.idx === AscFormat.fntStyleInd_major)
                    first_name = "+mj-";
                else
                    first_name = "+mn-";

                shape_text_style.TextPr.RFonts.Ascii = {Name: first_name + "lt", Index: -1};
                shape_text_style.TextPr.RFonts.EastAsia = {Name: first_name + "ea", Index: -1};
                shape_text_style.TextPr.RFonts.CS = {Name: first_name + "cs", Index: -1};
                shape_text_style.TextPr.RFonts.HAnsi = {Name: first_name + "lt", Index: -1};

                if (this.style.fontRef.Color != null && this.style.fontRef.Color.color != null) {
                    var unifill = new AscFormat.CUniFill();
                    unifill.fill = new AscFormat.CSolidFill();
                    unifill.fill.color = this.style.fontRef.Color;
                    shape_text_style.TextPr.Unifill = unifill;
                }
            }
            var Styles = new CStyles(false);


            var last_style_id;
            var b_checked = false;
            var isPlaceholder = this.isPlaceholder();
            if (isPlaceholder || this.graphicObject instanceof CTable) {
                if (default_style) {
                    //checkTextPr(default_style.TextPr);
                    b_checked = true;
                    Styles.Add(default_style);
                    default_style.BasedOn = null;
                    last_style_id = default_style.Id;
                }

                if (master_style) {
                    //checkTextPr(master_style.TextPr);
                    Styles.Add(master_style);
                    master_style.BasedOn = last_style_id;
                    last_style_id = master_style.Id;
                }
            }
            else {
                if (master_style) {
                    // checkTextPr(master_style.TextPr);
                    b_checked = true;
                    Styles.Add(master_style);
                    master_style.BasedOn = null;
                    last_style_id = master_style.Id;
                }

                if (default_style) {
                    //checkTextPr(default_style.TextPr);
                    Styles.Add(default_style);
                    default_style.BasedOn = last_style_id;
                    last_style_id = default_style.Id;
                }
            }

            for (var i = hierarchy_styles.length - 1; i > -1; --i) {

                if (hierarchy_styles[i]) {
                    //checkTextPr(hierarchy_styles[i].TextPr);
                    Styles.Add(hierarchy_styles[i]);
                    hierarchy_styles[i].BasedOn = last_style_id;
                    last_style_id = hierarchy_styles[i].Id;
                }
            }


            if (shape_text_style) {
                //checkTextPr(shape_text_style.TextPr);
                Styles.Add(shape_text_style);
                shape_text_style.BasedOn = last_style_id;
                last_style_id = shape_text_style.Id;
            }

            this.compiledStyles[level] = {styles: Styles, lastId: last_style_id};
            return this.compiledStyles[level];
        }, this, []);
    },

    recalculateBrush: function () {
        var compiled_style = this.getCompiledStyle();
        var RGBA = {R: 0, G: 0, B: 0, A: 255};
        var parents = this.getParentObjects();
        if (isRealObject(parents.theme) && isRealObject(compiled_style) && isRealObject(compiled_style.fillRef)) {
            //compiled_style.fillRef.Color.Calculate(parents.theme, parents.slide, parents.layout, parents.master, {R: 0, G: 0, B: 0, A:255});
            //RGBA = compiled_style.fillRef.Color.RGBA;
            this.brush = parents.theme.getFillStyle(compiled_style.fillRef.idx, compiled_style.fillRef.Color);
            //if (isRealObject(this.brush))
            //{
            //    if (isRealObject(compiled_style.fillRef.Color.color)
            //        && isRealObject(this.brush)
            //        && isRealObject(this.brush.fill)
            //        && this.brush.fill.type === FILL_TYPE_SOLID)
            //    {
            //        this.brush.fill.color = compiled_style.fillRef.Color.createDuplicate();
            //    }
            //}
            //else
            //{
            //    this.brush = new AscFormat.CUniFill();
            //}
        }
        else {
            this.brush = new AscFormat.CUniFill();
        }

        this.brush.merge(this.getCompiledFill());
        this.brush.transparent = this.getCompiledTransparent();
        this.brush.calculate(parents.theme, parents.slide, parents.layout, parents.master, RGBA);
    },

    recalculatePen: function () {
        var compiled_style = this.getCompiledStyle();
        var RGBA = {R: 0, G: 0, B: 0, A: 255};
        var parents = this.getParentObjects();
        if (isRealObject(parents.theme) && isRealObject(compiled_style) && isRealObject(compiled_style.lnRef)) {
            //compiled_style.lnRef.Color.Calculate(parents.theme, parents.slide, parents.layout, parents.master, {R: 0, G: 0, B: 0, A:255});
            //RGBA = compiled_style.lnRef.Color.RGBA;
            this.pen = parents.theme.getLnStyle(compiled_style.lnRef.idx, compiled_style.lnRef.Color);
            //if (isRealObject(this.pen)) {
            //    if (isRealObject(compiled_style.lnRef.Color.color)
            //        && isRealObject(this.pen)
            //        && isRealObject(this.pen.Fill)
            //        && isRealObject(this.pen.Fill.fill)
            //        && this.pen.Fill.fill.type === FILL_TYPE_SOLID) {
            //        this.pen.Fill.fill.color = compiled_style.lnRef.Color.createDuplicate();
            //    }
            //}
            //else
            //{
            //    this.pen = new AscFormat.CLn();
            //}
        }
        else {
            this.pen = new AscFormat.CLn();
        }

        this.pen.merge(this.getCompiledLine());
        this.pen.calculate(parents.theme, parents.slide, parents.layout, parents.master, RGBA);
    },

    Get_ParentTextTransform: function()
    {
        return this.transformText.CreateDublicate();
    },

    isEmptyPlaceholder: function () {
        if (this.isPlaceholder()) {
            if (this.nvSpPr.nvPr.ph.type == AscFormat.phType_title
                || this.nvSpPr.nvPr.ph.type == AscFormat.phType_ctrTitle
                || this.nvSpPr.nvPr.ph.type == AscFormat.phType_body
                || this.nvSpPr.nvPr.ph.type == AscFormat.phType_subTitle
                || this.nvSpPr.nvPr.ph.type == null
                || this.nvSpPr.nvPr.ph.type == AscFormat.phType_dt
                || this.nvSpPr.nvPr.ph.type == AscFormat.phType_ftr
                || this.nvSpPr.nvPr.ph.type == AscFormat.phType_hdr
                || this.nvSpPr.nvPr.ph.type == AscFormat.phType_sldNum
                || this.nvSpPr.nvPr.ph.type == AscFormat.phType_sldImg) {
                if (this.txBody) {
                    if (this.txBody.content) {
                        return this.txBody.content.Is_Empty();
                    }
                    return true;
                }
                return true;
            }
            if (this.nvSpPr.nvPr.ph.type == AscFormat.phType_chart
                || this.nvSpPr.nvPr.ph.type == AscFormat.phType_media) {
                return true;
            }
            if (this.nvSpPr.nvPr.ph.type == AscFormat.phType_pic) {
                var _b_empty_text = true;
                if (this.txBody) {
                    if (this.txBody.content) {
                        _b_empty_text = this.txBody.content.Is_Empty();
                    }
                }
                return (_b_empty_text /* && (this.brush == null || this.brush.fill == null)*/);
            }
        }
        else {
            return false;
        }
    },


    changeSize: function (kw, kh) {
        if (this.spPr && this.spPr.xfrm && this.spPr.xfrm.isNotNull()) {
            var xfrm = this.spPr.xfrm;
            xfrm.setOffX(xfrm.offX * kw);
            xfrm.setOffY(xfrm.offY * kh);
            xfrm.setExtX(xfrm.extX * kw);
            xfrm.setExtY(xfrm.extY * kh);
        }
        this.recalcTransform && this.recalcTransform();
    },

    recalculateTransform: function () {
        this.cachedImage = null;
        this.recalculateLocalTransform(this.transform);
        this.invertTransform = global_MatrixTransformer.Invert(this.transform);
        this.localTransform = this.transform.CreateDublicate();
    },


    checkAutofit: function (bIgnoreWordShape) {
        if (this.bWordShape || bIgnoreWordShape || this.bCheckAutoFitFlag) {
            var content = this.getDocContent();
            if (content) {
                var oBodyPr = this.getBodyPr();
                if (oBodyPr.textFit && oBodyPr.textFit.type === AscFormat.text_fit_Auto || oBodyPr.wrap === AscFormat.nTWTNone) {
                    return true;
                }
            }
        }
        return false;
    },

    Check_AutoFit: function () {
        return this.checkAutofit(true) || this.checkContentWordArt(this.getDocContent()) || this.getBodyPr().prstTxWarp != null;
    },

    checkExtentsByAutofit: function(oShape)
    {

    },


    recalculateLocalTransform: function(transform)
    {
        if (!isRealObject(this.group))
        {
            if(this.drawingBase  && this.fromSerialize)
            {
                var metrics = this.drawingBase.getGraphicObjectMetrics();
                this.x = metrics.x;
                this.y = metrics.y;
                extX = metrics.extX;
                extY = metrics.extY;
                var rot = this.spPr && this.spPr.xfrm && AscFormat.isRealNumber(this.spPr.xfrm.rot) ? normalizeRotate(this.spPr.xfrm.rot) : 0;
                this.rot = rot;
                var metricExtX, metricExtY;
                if(!(this instanceof AscFormat.CGroupShape))
                {
                    metricExtX = metrics.extX;
                    metricExtY = metrics.extY;
                    if (checkNormalRotate(rot))
                    {
                        this.extX = metrics.extX;
                        this.extY = metrics.extY;
                    }
                    else
                    {
                        this.extX = metrics.extY;
                        this.extY = metrics.extX;
                    }
                }
                else
                {
                    if(this.spPr && this.spPr.xfrm && AscFormat.isRealNumber(this.spPr.xfrm.extX) && AscFormat.isRealNumber(this.spPr.xfrm.extY))
                    {
                        this.extX = this.spPr.xfrm.extX;
                        this.extY = this.spPr.xfrm.extY;
                    }
                    else
                    {
                        metricExtX = metrics.extX;
                        metricExtY = metrics.extY;
                    }
                }

                if (checkNormalRotate(rot))
                {
                    this.x = metrics.x;
                    this.y = metrics.y;
                }
                else
                {
                    this.x = metrics.x + metricExtX/2 - metricExtY/2;
                    this.y = metrics.y + metricExtY/2 - metricExtX/2;
                }
            }

            else if (this.spPr && this.spPr.xfrm && this.spPr.xfrm.isNotNull())
            {
                var xfrm = this.spPr.xfrm;
                this.x = xfrm.offX;
                this.y = xfrm.offY;
                this.extX = xfrm.extX;
                this.extY = xfrm.extY;
                this.rot = AscFormat.isRealNumber(xfrm.rot) ? xfrm.rot : 0;
                this.flipH = xfrm.flipH === true;
                this.flipV = xfrm.flipV === true;
                if(this.extX < 0.01 && this.extY < 0.01)
                {
                    if(this.parent && this.parent.Extent && AscFormat.isRealNumber(this.parent.Extent.W) && AscFormat.isRealNumber(this.parent.Extent.H))
                    {
                        this.x = 0;
                        this.y = 0;
                        this.extX = this.parent.Extent.W;
                        this.extY = this.parent.Extent.H;
                    }
                }
                else
                {
                        var oParaDrawing = getParaDrawing(this);
                        if(oParaDrawing)
                        {
                            if(oParaDrawing.SizeRelH || oParaDrawing.SizeRelV)
                            {
                                this.m_oSectPr = null;
                                var oParentParagraph = oParaDrawing.Get_ParentParagraph();
                                if(oParentParagraph)
                                {

                                    var oSectPr = oParentParagraph.Get_SectPr();
                                    if(oSectPr)
                                    {
                                        if(oParaDrawing.SizeRelH && oParaDrawing.SizeRelH.Percent > 0)
                                        {
                                            switch(oParaDrawing.SizeRelH.RelativeFrom)
                                            {
                                                case c_oAscSizeRelFromH.sizerelfromhMargin:
                                                {
                                                    this.extX = oSectPr.Get_PageWidth() - oSectPr.Get_PageMargin_Left() - oSectPr.Get_PageMargin_Right();
                                                    break;
                                                }
                                                case c_oAscSizeRelFromH.sizerelfromhPage:
                                                {
                                                    this.extX = oSectPr.Get_PageWidth();
                                                    break;
                                                }
                                                case c_oAscSizeRelFromH.sizerelfromhLeftMargin:
                                                {
                                                    this.extX = oSectPr.Get_PageMargin_Left();
                                                    break;
                                                }

                                                case c_oAscSizeRelFromH.sizerelfromhRightMargin:
                                                {
                                                    this.extX = oSectPr.Get_PageMargin_Right();
                                                    break;
                                                }
                                                default:
                                                {
                                                    this.extX = oSectPr.Get_PageMargin_Left();
                                                    break;
                                                }
                                            }
                                            this.extX *= oParaDrawing.SizeRelH.Percent;
                                        }
                                        if(oParaDrawing.SizeRelV && oParaDrawing.SizeRelV.Percent > 0)
                                        {
                                            switch(oParaDrawing.SizeRelV.RelativeFrom)
                                            {
                                                case c_oAscSizeRelFromV.sizerelfromvMargin:
                                                {
                                                    this.extY = oSectPr.Get_PageHeight() - oSectPr.Get_PageMargin_Top() - oSectPr.Get_PageMargin_Bottom();
                                                    break;
                                                }
                                                case c_oAscSizeRelFromV.sizerelfromvPage:
                                                {
                                                    this.extY = oSectPr.Get_PageHeight();
                                                    break;
                                                }
                                                case c_oAscSizeRelFromV.sizerelfromvTopMargin:
                                                {
                                                    this.extY = oSectPr.Get_PageMargin_Top();
                                                    break;
                                                }
                                                case c_oAscSizeRelFromV.sizerelfromvBottomMargin:
                                                {
                                                    this.extY = oSectPr.Get_PageMargin_Bottom();
                                                    break;
                                                }
                                                default:
                                                {
                                                    this.extY = oSectPr.Get_PageMargin_Top();
                                                    break;
                                                }
                                            }
                                            this.extY *= oParaDrawing.SizeRelV.Percent;
                                        }
                                        this.m_oSectPr = new CSectionPr();
                                        this.m_oSectPr.Copy(oSectPr);
                                    }
                                }
                            }
                        }

                }
            }
            else
            {
                if (this.isPlaceholder())
                {
                    var hierarchy = this.getHierarchy();
                    for (var i = 0; i < hierarchy.length; ++i)
                    {
                        var hierarchy_sp = hierarchy[i];
                        if (isRealObject(hierarchy_sp)  && hierarchy_sp.spPr.xfrm && hierarchy_sp.spPr.xfrm.isNotNull())
                        {
                            var xfrm = hierarchy_sp.spPr.xfrm;
                            this.x = xfrm.offX;
                            this.y = xfrm.offY;
                            this.extX = xfrm.extX;
                            this.extY = xfrm.extY;
                            this.rot = AscFormat.isRealNumber(xfrm.rot) ? xfrm.rot : 0;
                            this.flipH = xfrm.flipH === true;
                            this.flipV = xfrm.flipV === true;
                            break;
                        }
                    }
                    if (i === hierarchy.length)
                    {
                        this.x = 0;
                        this.y = 0;
                        this.extX = 5;
                        this.extY = 5;
                        this.rot = 0;
                        this.flipH = false;
                        this.flipV = false;
                    }
                }
                else
                {
                    var extX, extY;
                    if(this.parent && this.parent.Extent)
                    {
                        this.x = 0;
                        this.y = 0;
                        extX = this.parent.Extent.W;
                        extY = this.parent.Extent.H;
                    }
                    else
                    {
                        this.x = 0;
                        this.y = 0;
                        extX = 5;
                        extY = 5;
                    }
                    this.extX = extX;
                    this.extY = extY;
                    this.rot = 0;
                    this.flipH = false;
                    this.flipV = false;
                }
            }
        }
        else
        {
            var xfrm;
            if (this.spPr && this.spPr.xfrm && this.spPr.xfrm.isNotNull())
            {
                xfrm = this.spPr.xfrm;
            }
            else
            {
                if (this.isPlaceholder()) {
                    var hierarchy = this.getHierarchy();
                    for (var i = 0; i < hierarchy.length; ++i) {
                        var hierarchy_sp = hierarchy[i];
                        if (isRealObject(hierarchy_sp) && hierarchy_sp.spPr.xfrm.isNotNull()) {
                            xfrm = hierarchy_sp.spPr.xfrm;
                            break;
                        }
                    }
                    if (i === hierarchy.length) {
                        xfrm = new AscFormat.CXfrm();
                        xfrm.offX = 0;
                        xfrm.offX = 0;
                        xfrm.extX = 5;
                        xfrm.extY = 5;
                    }
                }
                else {
                    xfrm = new AscFormat.CXfrm();
                    xfrm.offX = 0;
                    xfrm.offY = 0;
                    xfrm.extX = 5;
                    xfrm.extY = 5;
                }
            }


            var scale_scale_coefficients = this.group.getResultScaleCoefficients();
            this.x = scale_scale_coefficients.cx * (xfrm.offX - this.group.spPr.xfrm.chOffX);
            this.y = scale_scale_coefficients.cy * (xfrm.offY - this.group.spPr.xfrm.chOffY);
            this.extX = scale_scale_coefficients.cx * xfrm.extX;
            this.extY = scale_scale_coefficients.cy * xfrm.extY;
            this.rot = AscFormat.isRealNumber(xfrm.rot) ? xfrm.rot : 0;
            this.flipH = xfrm.flipH === true;
            this.flipV = xfrm.flipV === true;
        }


        if(this.checkAutofit && this.checkAutofit() && (!this.bWordShape || !this.group || this.bCheckAutoFitFlag)) {
            var oBodyPr = this.getBodyPr();
            if (this.bWordShape) {
                if (this.recalcInfo.recalculateTxBoxContent) {
                    this.recalcInfo.oContentMetrics = this.recalculateTxBoxContent();
                    //this.recalcInfo.recalculateTxBoxContent = false;
                    this.recalcInfo.AllDrawings = [];
                    var oContent = this.getDocContent();
                    if(oContent)
                    {
                        oContent.Get_AllDrawingObjects(this.recalcInfo.AllDrawings);
                    }
                }
            }
            else {
                if (this.recalcInfo.recalculateContent) {
                    this.recalcInfo.oContentMetrics = this.recalculateContent();
                    this.recalcInfo.recalculateContent = false;
                }
            }
            var oContentMetrics = this.recalcInfo.oContentMetrics;

            var l_ins, t_ins, r_ins, b_ins;
            if (oBodyPr) {
                l_ins = AscFormat.isRealNumber(oBodyPr.lIns) ? oBodyPr.lIns : 2.54;
                r_ins = AscFormat.isRealNumber(oBodyPr.rIns) ? oBodyPr.rIns : 2.54;
                t_ins = AscFormat.isRealNumber(oBodyPr.tIns) ? oBodyPr.tIns : 1.27;
                b_ins = AscFormat.isRealNumber(oBodyPr.bIns) ? oBodyPr.bIns : 1.27;
            }
            else {
                l_ins = 2.54;
                r_ins = 2.54;
                t_ins = 1.27;
                b_ins = 1.27;
            }
            var oGeometry = this.spPr && this.spPr.geometry, oWH;
            var dOldExtX = this.extX, dOldExtY = this.extY, dDeltaX = 0, dDeltaY = 0;


            if (oBodyPr.wrap === AscFormat.nTWTNone) {
                if (!oBodyPr.upright) {
                    if (!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270)) {
                        if (oGeometry) {
                            oWH = oGeometry.getNewWHByTextRect(oContentMetrics.w + l_ins + r_ins, oContentMetrics.contentH + t_ins + b_ins);
                            if(!oWH.bError)
                            {
                                this.extX = oWH.W;
                                this.extY = oWH.H;
                            }
                        }
                        else {
                            this.extX = oContentMetrics.w + l_ins + r_ins;
                            this.extY = oContentMetrics.contentH + t_ins + b_ins;
                        }

                    }
                    else {
                        if (oGeometry) {
                            oWH = oGeometry.getNewWHByTextRect(oContentMetrics.w + t_ins + b_ins, oContentMetrics.contentH + l_ins + r_ins);
                            if(!oWH.bError)
                            {
                                this.extX = oWH.H;
                                this.extY = oWH.W;
                            }
                        }
                        else {
                            this.extY = oContentMetrics.w + t_ins + b_ins;
                            this.extX = oContentMetrics.contentH + l_ins + r_ins;
                        }
                    }
                }
                else {
                    var _full_rotate = this.getFullRotate();
                    if (checkNormalRotate(_full_rotate)) {
                        if (!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270)) {

                            if (oGeometry) {
                                oWH = oGeometry.getNewWHByTextRect(oContentMetrics.w + l_ins + r_ins, oContentMetrics.contentH + t_ins + b_ins);
                                if(!oWH.bError) {
                                    this.extX = oWH.W;
                                    this.extY = oWH.H;
                                }
                            }
                            else {
                                this.extX = oContentMetrics.w + l_ins + r_ins;
                                this.extY = oContentMetrics.contentH + t_ins + b_ins;
                            }
                        }
                        else {
                            if (oGeometry) {
                                oWH = oGeometry.getNewWHByTextRect(oContentMetrics.w + t_ins + b_ins, oContentMetrics.contentH + l_ins + r_ins);
                                if(!oWH.bError) {
                                    this.extX = oWH.H;
                                    this.extY = oWH.W;
                                }
                            }
                            else {
                                this.extY = oContentMetrics.w + t_ins + b_ins;
                                this.extX = oContentMetrics.contentH + l_ins + r_ins;
                            }

                        }
                    }
                    else {
                        if (!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270)) {
                            if (oGeometry) {
                                oWH = oGeometry.getNewWHByTextRect(oContentMetrics.w + l_ins + r_ins, oContentMetrics.contentH + t_ins + b_ins);
                                if(!oWH.bError) {
                                    this.extX = oWH.W;
                                    this.extY = oWH.H;
                                }
                            }
                            else {
                                this.extX = oContentMetrics.w + l_ins + r_ins;
                                this.extY = oContentMetrics.contentH + t_ins + b_ins;
                            }
                        }
                        else {
                            if (oGeometry) {
                                oWH = oGeometry.getNewWHByTextRect(oContentMetrics.w + t_ins + b_ins, oContentMetrics.contentH + l_ins + r_ins);
                                if(!oWH.bError) {
                                    this.extX = oWH.H;
                                    this.extY = oWH.W;
                                }
                            }
                            else {
                                this.extY = oContentMetrics.w + t_ins + b_ins;
                                this.extX = oContentMetrics.contentH + l_ins + r_ins;
                            }
                        }
                    }
                }
            }
            else {
                if (!oBodyPr.upright) {
                    if (!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270)) {
                        if (oGeometry) {
                            oWH = oGeometry.getNewWHByTextRect(undefined, oContentMetrics.contentH + t_ins + b_ins, this.extX, undefined);
                            if(!oWH.bError) {
                                this.extY = oWH.H;
                            }
                        }
                        else {
                            this.extY = oContentMetrics.contentH + t_ins + b_ins;
                        }
                    }
                    else {
                        if (oGeometry) {
                            oWH = oGeometry.getNewWHByTextRect(oContentMetrics.contentH + l_ins + b_ins, undefined, undefined, this.extY);
                            if(!oWH.bError) {
                                this.extX = oWH.W;
                            }
                        }
                        else {
                            this.extX = oContentMetrics.contentH + l_ins + r_ins;
                        }
                    }
                }
                else {
                    var _full_rotate = this.getFullRotate();
                    if (checkNormalRotate(_full_rotate)) {
                        if (!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270)) {
                            if (oGeometry) {
                                oWH = oGeometry.getNewWHByTextRect(undefined, oContentMetrics.contentH + t_ins + b_ins, this.extX, undefined);
                                if(!oWH.bError) {
                                    this.extY = oWH.H;
                                }
                            }
                            else {
                                this.extY = oContentMetrics.contentH + t_ins + b_ins;
                            }
                        }
                        else {
                            if (oGeometry) {
                                oWH = oGeometry.getNewWHByTextRect(oContentMetrics.contentH + l_ins + r_ins, undefined, undefined, this.extY);
                                if(!oWH.bError) {
                                    this.extX = oWH.W;
                                }
                            }
                            else {
                                this.extX = oContentMetrics.contentH + l_ins + r_ins;
                            }
                        }
                    }
                    else {
                        if (!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270)) {
                            if (oGeometry) {
                                oWH = oGeometry.getNewWHByTextRect(oContentMetrics.contentH + l_ins + r_ins, undefined, undefined, this.extY);
                                if(!oWH.bError) {
                                    this.extX = oWH.W;
                                }
                            }
                            else {
                                this.extX = oContentMetrics.contentH + l_ins + r_ins;
                            }
                        }
                        else {
                            if (oGeometry) {
                                oWH = oGeometry.getNewWHByTextRect(undefined, oContentMetrics.contentH + t_ins + b_ins, this.extX, undefined);
                                if(!oWH.bError) {
                                    this.extY = oWH.H;
                                }
                            }
                            else {
                                this.extY = oContentMetrics.contentH + t_ins + b_ins;
                            }
                        }
                    }
                }
            }

            if(!this.bWordShape || this.group)//в презентациях и в таблицах изменям позицию: по горизонтали - в зависимости от выравнивания первого параграфа в контенте,
            // по вертикали - в зависимости от вертикального выравнивания контента.
            {
                var dSin = Math.sin(this.rot), dCos = Math.cos(this.rot);
                var nJc = this.getDocContent().Content[0].CompiledPr.Pr.ParaPr.Jc;
                switch(nJc)
                {
                    case AscCommon.align_Right:
                    {
                        dDeltaX = dOldExtX - this.extX;
                        break;
                    }
                    case AscCommon.align_Left:
                    {
                        dDeltaX = 0;
                        break;
                    }
                    case AscCommon.align_Center:
                    case AscCommon.align_Justify:
                    {
                        dDeltaX = (dOldExtX - this.extX)/2;
                        break;
                    }
                }
                switch (oBodyPr.anchor)
                {
                    case 0: //b
                    {
                        dDeltaY = dOldExtY - this.extY;
                        break;
                    }
                    case 1:    //ctr
                    case 2: //dist
                    case 3: //just
                    {// (Text Anchor Enum ( Center ))
                        dDeltaY = (dOldExtY - this.extY) / 2;
                        break;
                    }
                    case 4: //t
                    {//Top
                        break;
                    }
                }
                var dTrDeltaX, dTrDeltaY;
                dTrDeltaX = dCos*dDeltaX - dSin*dDeltaY;
                dTrDeltaY = dSin*dDeltaX + dCos*dDeltaY;
                this.x += dTrDeltaX;
                this.y += dTrDeltaY;
            }
        }
        this.localX = this.x;
        this.localY = this.y;
        transform.Reset();
        var hc = this.extX * 0.5;
        var vc = this.extY * 0.5;
        global_MatrixTransformer.TranslateAppend(transform, -hc, -vc);
        if (this.flipH)
            global_MatrixTransformer.ScaleAppend(transform, -1, 1);
        if (this.flipV)
            global_MatrixTransformer.ScaleAppend(transform, 1, -1);
        global_MatrixTransformer.RotateRadAppend(transform, -this.rot);
        global_MatrixTransformer.TranslateAppend(transform, this.x + hc, this.y + vc);
        if (isRealObject(this.group)) {
            global_MatrixTransformer.MultiplyAppend(transform, this.group.getLocalTransform());
        }
        var oParaDrawing = getParaDrawing(this);
        if(oParaDrawing) {
            this.m_oSectPr = null;
            var oParentParagraph = oParaDrawing.Get_ParentParagraph();
            if (oParentParagraph) {
                var oSectPr = oParentParagraph.Get_SectPr();
                if(oSectPr)
                {
                    this.m_oSectPr = new CSectionPr();
                    this.m_oSectPr.Copy(oSectPr);
                }
            }
        }
        this.localTransform = transform;
        this.transform = transform;
    },

    CheckNeedRecalcAutoFit : function(oSectPr)
    {
        var Width, Height, Width2, Height2;
        var bRet = false;
        var oParaDrawing = getParaDrawing(this);
        var bSizRel = (oParaDrawing && (oParaDrawing.SizeRelH || oParaDrawing.SizeRelV));
        if(this.checkAutofit() || bSizRel )
        {
            if(oSectPr)
            {
                if(!this.m_oSectPr)
                {
                    this.recalcBounds();
                    this.recalcText();
                    this.recalcGeometry();
                    if(bSizRel)
                    {
                        this.recalcTransform();
                    }
                    bRet = true;
                }
                else
                {

                    Width = oSectPr.Get_PageWidth() - oSectPr.Get_PageMargin_Left() - oSectPr.Get_PageMargin_Right();
                    Height = oSectPr.Get_PageHeight() - oSectPr.Get_PageMargin_Top() - oSectPr.Get_PageMargin_Bottom();

                    Width2 = this.m_oSectPr.Get_PageWidth() - this.m_oSectPr.Get_PageMargin_Left() - this.m_oSectPr.Get_PageMargin_Right();
                    Height2 = this.m_oSectPr.Get_PageHeight() - this.m_oSectPr.Get_PageMargin_Top() - this.m_oSectPr.Get_PageMargin_Bottom();
                    bRet = (Math.abs(Width - Width2) > 0.001 || Math.abs(Height - Height2) > 0.001);
                    if(bRet)
                    {
                        this.recalcBounds();
                        this.recalcText();
                        this.recalcGeometry();
                        if(bSizRel)
                        {
                            this.recalcTransform();
                        }
                    }
                    return bRet;
                }
            }
            else
            {
                if(this.m_oSectPr)
                {
                    this.recalcBounds();
                    this.recalcText();
                    this.recalcGeometry();
                    bRet = true;
                }
            }
        }
        return bRet;
    },


    recalculateDocContent: function(oDocContent, oBodyPr)
    {
        var oRet = {w: 0, h: 0, contentH: 0};
        var l_ins, t_ins, r_ins, b_ins;
        if(oBodyPr)
        {
            l_ins = AscFormat.isRealNumber(oBodyPr.lIns) ? oBodyPr.lIns : 2.54;
            r_ins = AscFormat.isRealNumber(oBodyPr.rIns) ? oBodyPr.rIns : 2.54;
            t_ins = AscFormat.isRealNumber(oBodyPr.tIns) ? oBodyPr.tIns : 1.27;
            b_ins = AscFormat.isRealNumber(oBodyPr.bIns) ? oBodyPr.bIns : 1.27;
        }
        else
        {
            l_ins = 2.54;
            r_ins = 2.54;
            t_ins = 1.27;
            b_ins = 1.27;
        }
        var oRect = this.getTextRect();
        var w, h;
        w = oRect.r - oRect.l - (l_ins + r_ins);
        h = oRect.b - oRect.t - (t_ins + b_ins);
        if(oBodyPr.wrap === AscFormat.nTWTNone)
        {
            var dMaxWidth = 100000;
            if(this.bWordShape)
            {
                this.m_oSectPr = null;
                var oParaDrawing = getParaDrawing(this);
                if(oParaDrawing)
                {
                    var oParentParagraph = oParaDrawing.Get_ParentParagraph();
                    if(oParentParagraph)
                    {
                        var oSectPr = oParentParagraph.Get_SectPr();
                        if(oSectPr)
                        {
                            if(!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270))
                            {
                                dMaxWidth = oSectPr.Get_PageWidth() - oSectPr.Get_PageMargin_Left() - oSectPr.Get_PageMargin_Right() - l_ins - r_ins;
                            }
                            else
                            {
                                dMaxWidth = oSectPr.Get_PageHeight() - oSectPr.Get_PageMargin_Top() - oSectPr.Get_PageMargin_Bottom();
                            }
                            this.m_oSectPr = new CSectionPr();
                            this.m_oSectPr.Copy(oSectPr);
                        }
                    }
                }
            }
            var dMaxWidthRec = RecalculateDocContentByMaxLine(oDocContent, dMaxWidth, this.bWordShape);
            if(!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270))
            {
                if(dMaxWidthRec < w && (!this.bWordShape && !this.bCheckAutoFitFlag))
                {
                    oDocContent.Set_StartPage(0);
                    oDocContent.Reset(0, 0, w, 20000);
                    oDocContent.Recalculate_Page(oDocContent.StartPage, true);
                    oRet.w = w + 0.001;
                    oRet.contentH = oDocContent.Get_SummaryHeight();
                    oRet.h = oRet.contentH;
                }
                else
                {
                    oDocContent.Set_StartPage(0);
                    oDocContent.Reset(0, 0, dMaxWidthRec, 20000);
                    oDocContent.Recalculate_Page(oDocContent.StartPage, true);
                    oRet.w = dMaxWidthRec + 0.001;
                    oRet.contentH = oDocContent.Get_SummaryHeight();
                    oRet.h = oRet.contentH;
                }
                oRet.correctW = l_ins + r_ins;
                oRet.correctH = t_ins + b_ins;
                oRet.textRectW = w;
                oRet.textRectH = h;
            }
            else
            {
                if(dMaxWidthRec < h && !this.bWordShape)
                {
                    oDocContent.Set_StartPage(0);
                    oDocContent.Reset(0, 0, h, 20000);
                    oDocContent.Recalculate_Page(oDocContent.StartPage, true);
                    oRet.w = h + 0.001;
                    oRet.contentH = oDocContent.Get_SummaryHeight();
                    oRet.h = oRet.contentH;
                }
                else
                {
                    oDocContent.Set_StartPage(0);
                    oDocContent.Reset(0, 0, dMaxWidthRec, 20000);
                    oDocContent.Recalculate_Page(oDocContent.StartPage, true);
                    oRet.w = dMaxWidthRec + 0.001;
                    oRet.contentH = oDocContent.Get_SummaryHeight();
                    oRet.h = oRet.contentH;
                }
                oRet.correctW = t_ins + b_ins;
                oRet.correctH = l_ins + r_ins;
                oRet.textRectW = h;
                oRet.textRectH = w;
            }
        }
        else//AscFormat.nTWTSquare
        {

            if(!oBodyPr.upright)
            {
                if(!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270))
                {
                    oRet.w = w + 0.001;
                    oRet.h = h + 0.001;
                    oRet.correctW = l_ins + r_ins;
                    oRet.correctH = t_ins + b_ins;
                }
                else
                {
                    oRet.w = h + 0.001;
                    oRet.h = w + 0.001;
                    oRet.correctW = t_ins + b_ins;
                    oRet.correctH = l_ins + r_ins;
                }
            }
            else
            {
                var _full_rotate = this.getFullRotate();
                if(checkNormalRotate(_full_rotate))
                {
                    if(!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270))
                    {
                        oRet.w = w + 0.001;
                        oRet.h = h + 0.001;
                        oRet.correctW = l_ins + r_ins;
                        oRet.correctH = t_ins + b_ins;
                    }
                    else
                    {
                        oRet.w = h + 0.001;
                        oRet.h = w + 0.001;
                        oRet.correctW = t_ins + b_ins;
                        oRet.correctH = l_ins + r_ins;
                    }
                }
                else
                {
                    if(!(oBodyPr.vert === AscFormat.nVertTTvert || oBodyPr.vert === AscFormat.nVertTTvert270))
                    {
                        oRet.w = h + 0.001;
                        oRet.h = w + 0.001;
                        oRet.correctW = t_ins + b_ins;
                        oRet.correctH = l_ins + r_ins;
                    }
                    else
                    {
                        oRet.w = w + 0.001;
                        oRet.h = h + 0.001;
                        oRet.correctW = l_ins + r_ins;
                        oRet.correctH = t_ins + b_ins;
                    }
                }
            }
            oRet.textRectW = oRet.w;
            oRet.textRectH = oRet.h;

            //oDocContent.Set_StartPage(0);
            oDocContent.Reset(0, 0, oRet.w, 20000);
            var CurPage = 0;
            var RecalcResult = recalcresult2_NextPage;
            while ( recalcresult2_End !== RecalcResult  )
                RecalcResult = oDocContent.Recalculate_Page( CurPage++, true );
            oRet.contentH = oDocContent.Get_SummaryHeight();

            if(this.bWordShape)
            {
                this.m_oSectPr = null;
                var oParaDrawing = getParaDrawing(this);
                if(oParaDrawing)
                {
                    var oParentParagraph = oParaDrawing.Get_ParentParagraph();
                    if(oParentParagraph)
                    {
                        var oSectPr = oParentParagraph.Get_SectPr();
                        if(oSectPr)
                        {
                            this.m_oSectPr = new CSectionPr();
                            this.m_oSectPr.Copy(oSectPr);
                        }
                    }
                }
            }
        }
        return oRet;
    },

    checkExtentsByDocContent: function(bForce, bNeedRecalc)
    {
        if((!this.bWordShape || this.group || bForce) && this.checkAutofit(true))
        {
            var oMainGroup = this.getMainGroup();
            if(oMainGroup && !(bNeedRecalc === false))
            {
                oMainGroup.normalize();
            }
            this.bCheckAutoFitFlag = true;
            var oOldRecalcTitle = this.recalcInfo.recalcTitle;
            var bOldRecalcTitle = this.recalcInfo.bRecalculatedTitle;
            this.handleUpdateExtents();
            this.recalcInfo.bRecalculatedTitle = false;
            this.recalcInfo.recalcTitle = this;
            this.recalculate();
            this.bCheckAutoFitFlag = false;
            this.recalcInfo.recalcTitle =  oOldRecalcTitle;
            this.recalcInfo.bRecalculatedTitle =  bOldRecalcTitle;
            AscFormat.CheckSpPrXfrm(this, true);
            this.spPr.xfrm.setExtX(this.extX + 0.001);
            this.spPr.xfrm.setExtY(this.extY + 0.001);
            if(!this.bWordShape || this.group)
            {
                this.spPr.xfrm.setOffX(this.x);
                this.spPr.xfrm.setOffY(this.y);
                if(this.drawingBase)
                {
                    CheckExcelDrawingXfrm(this.spPr.xfrm);
                }
            }
            if(!(bNeedRecalc === false))
            {
                if(oMainGroup)
                {
                    oMainGroup.updateCoordinatesAfterInternalResize();
                    if(oMainGroup.parent && oMainGroup.parent.CheckWH)
                    {
                        oMainGroup.parent.CheckWH();
                        if(this.bWordShape)
                        {
                            editor.WordControl.m_oLogicDocument.Recalculate();
                        }
                    }
                }
                else
                {
                    this.checkDrawingBaseCoords();
                }
            }
            return true;
        }
        return false;
    },


    checkDrawingBaseCoords: function()
    {
        if(this.drawingBase && this.spPr && this.spPr.xfrm && !this.group)
        {
            var oldX = this.x, oldY = this.y, oldExtX = this.extX, oldExtY = this.extY;
            this.x = this.spPr.xfrm.offX;
            this.y = this.spPr.xfrm.offY;
            this.extX = this.spPr.xfrm.extX;
            this.extY = this.spPr.xfrm.extY;



            var oldFromCol = this.drawingBase.from.col,
                oldFromColOff =  this.drawingBase.from.colOff,
                oldFromRow =  this.drawingBase.from.row,
                oldFromRowOff =  this.drawingBase.from.rowOff,
                oldToCol =       this.drawingBase.to.col,
                oldToColOff =    this.drawingBase.to.colOff,
                oldToRow    =    this.drawingBase.to.row,
                oldToRowOff =    this.drawingBase.to.rowOff,
                oldPosX     =    this.drawingBase.Pos.X,
                oldPosY     =    this.drawingBase.Pos.Y,
                oldCx       =    this.drawingBase.ext.cx,
                oldCy       =    this.drawingBase.ext.cy;


            this.drawingBase.setGraphicObjectCoords();
            this.x = oldX;
            this.y = oldY;
            this.extX = oldExtX;
            this.extY = oldExtY;
            var from = this.drawingBase.from, to = this.drawingBase.to;
            History.Add(this, {Type: AscDFH.historyitem_AutoShapes_SetDrawingBaseCoors,
                fromCol       : from.col,
                fromColOff    : from.colOff,
                fromRow       : from.row,
                fromRowOff    : from.rowOff,
                toCol         : to.col,
                toColOff      : to.colOff,
                toRow         : to.row,
                toRowOff      : to.rowOff,
                posX          : this.drawingBase.Pos.X,
                posY          : this.drawingBase.Pos.Y,
                cx            : this.drawingBase.ext.cx,
                cy            : this.drawingBase.ext.cy,

                oldFromCol    : oldFromCol,
                oldFromColOff : oldFromColOff,
                oldFromRow    : oldFromRow,
                oldFromRowOff : oldFromRowOff,
                oldToCol      : oldToCol,
                oldToColOff   : oldToColOff,
                oldToRow      : oldToRow,
                oldToRowOff   : oldToRowOff,
                oldPosX       : oldPosX,
                oldPosY       : oldPosY ,
                oldCx         : oldCx,
                oldCy         : oldCy
        });
        }
    },

    setDrawingBaseCoords: function(fromCol, fromColOff, fromRow, fromRowOff, toCol, toColOff, toRow, toRowOff, posX, posY, extX, extY)
    {
        if(this.drawingBase)
        {
            History.Add(this, {Type: AscDFH.historyitem_AutoShapes_SetDrawingBaseCoors,
                fromCol:    fromCol,
                fromColOff: fromColOff,
                fromRow   : fromRow,
                fromRowOff: fromRowOff,
                toCol:    toCol,
                toColOff: toColOff,
                toRow   : toRow,
                toRowOff: toRowOff,
                posX    : posX,
                posY    : posY,
                cx      : extX,
                cy      : extY,

                oldFromCol   : this.drawingBase.from.col,
                oldFromColOff: this.drawingBase.from.colOff,
                oldFromRow   : this.drawingBase.from.row,
                oldFromRowOff: this.drawingBase.from.rowOff,
                oldToCol     : this.drawingBase.to.col,
                oldToColOff  : this.drawingBase.to.colOff,
                oldToRow     : this.drawingBase.to.row,
                oldToRowOff  : this.drawingBase.to.rowOff,
                oldPosX      : this.drawingBase.Pos.X,
                oldPosY      : this.drawingBase.Pos.Y,
                oldCx        : this.drawingBase.ext.cx,
                oldCy        : this.drawingBase.ext.cy
            });


            this.drawingBase.from.col    = fromCol;
            this.drawingBase.from.colOff = fromColOff;
            this.drawingBase.from.row    = fromRow;
            this.drawingBase.from.rowOff = fromRowOff;

            this.drawingBase.to.col    = toCol;
            this.drawingBase.to.colOff = toColOff;
            this.drawingBase.to.row    = toRow;
            this.drawingBase.to.rowOff = toRowOff;

            this.drawingBase.Pos.X  = posX;
            this.drawingBase.Pos.Y  = posY;
            this.drawingBase.ext.cx = extX;
            this.drawingBase.ext.cy = extY;
        }
    },

    getTransformMatrix: function ()
    {
        return this.transform;
    },

    getTransform: function () {

        return { x: this.x, y: this.y, extX: this.extX, extY: this.extY, rot: this.rot, flipH: this.flipH, flipV: this.flipV };
    },

    getAngle: function (x, y) {
        var px = this.invertTransform.TransformPointX(x, y);
        var py = this.invertTransform.TransformPointY(x, y);
        return Math.PI * 0.5 + Math.atan2(px - this.extX * 0.5, py - this.extY * 0.5);
    },


    recalculateGeometry: function () {
        if (this.spPr && isRealObject(this.spPr.geometry)) {
            var transform = this.getTransform();
            this.spPr.geometry.Recalculate(transform.extX, transform.extY);
        }
    },
    drawAdjustments: function (drawingDocument) {
        if (this.spPr && isRealObject(this.spPr.geometry)) {
            this.spPr.geometry.drawAdjustments(drawingDocument, this.transform, false);
        }
        if(this.recalcInfo.warpGeometry)
        {
            this.recalcInfo.warpGeometry.drawAdjustments(drawingDocument, this.transformTextWordArt, true);
        }
    },

    getCardDirectionByNum: function (num) {
        var num_north = this.getNumByCardDirection(AscFormat.CARD_DIRECTION_N);
        var full_flip_h = this.getFullFlipH();
        var full_flip_v = this.getFullFlipV();
        var same_flip = !full_flip_h && !full_flip_v || full_flip_h && full_flip_v;
        if (same_flip)
            return ((num - num_north) + AscFormat.CARD_DIRECTION_N + 8) % 8;

        return (AscFormat.CARD_DIRECTION_N - (num - num_north) + 8) % 8;
    },

    getNumByCardDirection: function (cardDirection) {
        var hc = this.extX * 0.5;
        var vc = this.extY * 0.5;
        var transform = this.getTransformMatrix();
        var y1, y3, y5, y7;
        y1 = transform.TransformPointY(hc, 0);
        y3 = transform.TransformPointY(this.extX, vc);
        y5 = transform.TransformPointY(hc, this.extY);
        y7 = transform.TransformPointY(0, vc);

        var north_number;
        var full_flip_h = this.getFullFlipH();
        var full_flip_v = this.getFullFlipV();
        switch (Math.min(y1, y3, y5, y7)) {
            case y1:
            {
                north_number = !full_flip_v ? 1 : 5;
                break;
            }
            case y3:
            {
                north_number = !full_flip_h ? 3 : 7;
                break;
            }
            case y5:
            {
                north_number = !full_flip_v ? 5 : 1;
                break;
            }
            default:
            {
                north_number = !full_flip_h ? 7 : 3;
                break;
            }
        }
        var same_flip = !full_flip_h && !full_flip_v || full_flip_h && full_flip_v;

        if (same_flip)
            return (north_number + cardDirection) % 8;
        return (north_number - cardDirection + 8) % 8;
    },

    getResizeCoefficients: function (numHandle, x, y) {
        var cx, cy;
        cx = this.extX > 0 ? this.extX : 0.01;
        cy = this.extY > 0 ? this.extY : 0.01;

        var invert_transform = this.getInvertTransform();
        var t_x = invert_transform.TransformPointX(x, y);
        var t_y = invert_transform.TransformPointY(x, y);

        switch (numHandle) {
            case 0:
                return { kd1: (cx - t_x) / cx, kd2: (cy - t_y) / cy };
            case 1:
                return { kd1: (cy - t_y) / cy, kd2: 0 };
            case 2:
                return { kd1: (cy - t_y) / cy, kd2: t_x / cx };
            case 3:
                return { kd1: t_x / cx, kd2: 0 };
            case 4:
                return { kd1: t_x / cx, kd2: t_y / cy };
            case 5:
                return { kd1: t_y / cy, kd2: 0 };
            case 6:
                return { kd1: t_y / cy, kd2: (cx - t_x) / cx };
            case 7:
                return { kd1: (cx - t_x) / cx, kd2: 0 };
        }
        return { kd1: 1, kd2: 1 };
    },

    select: function (drawingObjectsController, pageIndex)
    {
        this.selected = true;
        this.selectStartPage = pageIndex;
        var content = this.getDocContent && this.getDocContent();
        if(content)
            content.Set_StartPage(pageIndex);
        var selected_objects;
        if (!isRealObject(this.group))
            selected_objects = drawingObjectsController.selectedObjects;
        else
            selected_objects = this.group.getMainGroup().selectedObjects;
        for (var i = 0; i < selected_objects.length; ++i) {
            if (selected_objects[i] === this)
                break;
        }
        if (i === selected_objects.length)
            selected_objects.push(this);
    },

    deselect: function (drawingObjectsController) {
        this.selected = false;
        this.addTextFlag = false;
        var selected_objects;
        if (!isRealObject(this.group))
            selected_objects = drawingObjectsController.selectedObjects;
        else
            selected_objects = this.group.getMainGroup().selectedObjects;
        for (var i = 0; i < selected_objects.length; ++i) {
            if (selected_objects[i] === this) {
                selected_objects.splice(i, 1);
                break;
            }
        }
        if(this.graphicObject)
        {
            this.graphicObject.Selection_Remove();
        }
        return this;
    },

    getMainGroup: function () {
        if (!isRealObject(this.group))
            return null;

        var cur_group = this.group;
        while (isRealObject(cur_group.group))
            cur_group = cur_group.group;
        return cur_group;
    },

    getGroupHierarchy: function () {
        if (this.recalcInfo.recalculateGroupHierarchy) {
            this.groupHierarchy = [];
            if (isRealObject(this.group)) {
                var parent_group_hierarchy = this.group.getGroupHierarchy();
                for (var i = 0; i < parent_group_hierarchy.length; ++i) {
                    this.groupHierarchy.push(parent_group_hierarchy[i]);
                }
                this.groupHierarchy.push(this.group);
            }
            this.recalcInfo.recalculateGroupHierarchy = false;
        }
        return this.groupHierarchy;
    },

    checkHitToBounds: function(x, y)
    {
        if(this.parent  &&(this.getObjectType() === AscDFH.historyitem_type_ImageShape && this.parent.isShapeChild && this.parent.isShapeChild()
            || this.parent.Get_ParentTextTransform  && this.parent.Get_ParentTextTransform()))
        {
            return true;
        }
        var _x, _y;
        if(AscFormat.isRealNumber(this.posX) && AscFormat.isRealNumber(this.posY))
        {
            _x = x - this.posX - this.bounds.x;
            _y = y - this.posY - this.bounds.y;
        }
        else
        {
            _x = x - this.bounds.x;
            _y = y - this.bounds.y;
        }
        var delta = BOUNDS_DELTA + (this.pen && AscFormat.isRealNumber(this.pen.w) ? this.pen.w/36000 : 0);
        return _x >= -delta && _x <= this.bounds.w + delta && _y >= -delta && _y <= this.bounds.h + delta;

    },

    hitInTextRectWord: function(x, y)
    {

        var content = this.getDocContent && this.getDocContent();
        if (content)
        {
            var t_x, t_y;
            t_x = this.invertTransform.TransformPointX(x, y);
            t_y = this.invertTransform.TransformPointY(x, y);

            var w, h, x_, y_;

            if(this.spPr && this.spPr.geometry && this.spPr.geometry.rect
                && AscFormat.isRealNumber(this.spPr.geometry.rect.l) && AscFormat.isRealNumber(this.spPr.geometry.rect.t)
                && AscFormat.isRealNumber(this.spPr.geometry.rect.r) && AscFormat.isRealNumber(this.spPr.geometry.rect.r))
            {
                x_ = this.spPr.geometry.rect.l;
                y_ = this.spPr.geometry.rect.t;
                w = this.spPr.geometry.rect.r - this.spPr.geometry.rect.l;
                h = this.spPr.geometry.rect.b - this.spPr.geometry.rect.t;
            }
            else
            {
                x_ = 0;
                y_ = 0;
                w = this.extX ;
                h = this.extY ;
            }
            return t_x > x_  && t_x < x_ + w && t_y > y_ && t_y < y_ + h;
        }
        return false;
    },


    hitInTextRect: function (x, y) {
        var oController = this.getDrawingObjectsController && this.getDrawingObjectsController();
        if(!this.txWarpStruct || !this.recalcInfo.warpGeometry ||
            this.recalcInfo.warpGeometry.preset === "textNoShape" ||
            oController && (AscFormat.getTargetTextObject(oController) === this || (oController.curState.startTargetTextObject === this)))
        {
            var content = this.getDocContent && this.getDocContent();
            if ( content && this.invertTransformText)
            {
                var t_x, t_y;
                t_x = this.invertTransformText.TransformPointX(x, y);
                t_y = this.invertTransformText.TransformPointY(x, y);
                return t_x > 0 && t_x < this.contentWidth && t_y > 0 && t_y < this.contentHeight;
            }
        }
        else
        {
            return this.hitInTextRectWord(x, y);
        }

        return false;
    },


    updateCursorType: function (x, y, e)
    {
        if(this.invertTransformText)
        {
            var tx = this.invertTransformText.TransformPointX(x, y);
            var ty = this.invertTransformText.TransformPointY(x, y);
            this.txBody.content.Update_CursorType(tx, ty, 0);
        }
    },



    selectionSetStart: function (e, x, y, slideIndex)
    {
        var content = this.getDocContent();
        if (isRealObject(content))
        {
            var tx, ty;
            tx = this.invertTransformText.TransformPointX(x, y);
            ty = this.invertTransformText.TransformPointY(x, y);
            if(e.Button === g_mouse_button_right)
            {
                if(content.Selection_Check(tx, ty,  0))
                {
                    this.rightButtonFlag = true;
                    return;
                }
            }
            if(!(content.Is_TextSelectionUse() && e.ShiftKey))
                content.Selection_SetStart(tx, ty, slideIndex, e);
            else
                content.Selection_SetEnd(tx, ty, slideIndex, e);
        }
    },

    selectionSetEnd: function (e, x, y, slideIndex)
    {
        var content = this.getDocContent();
        if (isRealObject(content)) {
            var tx, ty;
            tx = this.invertTransformText.TransformPointX(x, y);
            ty = this.invertTransformText.TransformPointY(x, y);
            if(!(e.Type === g_mouse_event_type_up && this.rightButtonFlag))
            {
                content.Selection_SetEnd(tx, ty, slideIndex, e);
            }
        }
        delete this.rightButtonFlag;
    },

    Get_Theme: function()
    {
        return this.getParentObjects().theme;
    },

    updateSelectionState: function ()
    {
        var drawing_document = this.getDrawingDocument();
        if(drawing_document)
        {
            var content = this.getDocContent();
            if(content)
            {
                var oMatrix = null;
                if(this.transformText)
                {
                    oMatrix = this.transformText.CreateDublicate();
                }
                drawing_document.UpdateTargetTransform(oMatrix);
                if ( true === content.Is_SelectionUse() )
                {
                    // Выделение нумерации
                    if ( selectionflag_Numbering == content.Selection.Flag )
                    {
                        drawing_document.TargetEnd();
                        drawing_document.SelectEnabled(true);
                        drawing_document.SelectClear();
                        drawing_document.SelectShow();
                    }
                    // Обрабатываем движение границы у таблиц
                    else if ( null != content.Selection.Data && true === content.Selection.Data.TableBorder && type_Table == content.Content[content.Selection.Data.Pos].GetType() )
                    {
                        // Убираем курсор, если он был
                        drawing_document.TargetEnd();
                    }
                    else
                    {
                        if ( false === content.Selection_IsEmpty() )
                        {
                            drawing_document.TargetEnd();
                            drawing_document.SelectEnabled(true);
                            drawing_document.SelectClear();
                            drawing_document.SelectShow();
                        }
                        else
                        {
                            drawing_document.SelectEnabled(false);
                            content.RecalculateCurPos();

                            drawing_document.TargetStart();
                            drawing_document.TargetShow();
                        }
                    }
                }
                else
                {
                    drawing_document.SelectEnabled(false);
                    content.RecalculateCurPos();

                    drawing_document.TargetStart();
                    drawing_document.TargetShow();
                }
            }
            else
            {
                drawing_document.UpdateTargetTransform(new CMatrix());
                drawing_document.TargetEnd();
                drawing_document.SelectEnabled(false);
                drawing_document.SelectClear();
                drawing_document.SelectShow();
            }
        }
    },

    normalize: function () {
        var new_off_x, new_off_y, new_ext_x, new_ext_y;
        var xfrm = this.spPr.xfrm;
        if (!isRealObject(this.group)) {
            new_off_x = xfrm.offX;
            new_off_y = xfrm.offY;
            new_ext_x = xfrm.extX;
            new_ext_y = xfrm.extY;
        }
        else {
            var scale_scale_coefficients = this.group.getResultScaleCoefficients();
            new_off_x = scale_scale_coefficients.cx * (xfrm.offX - this.group.spPr.xfrm.chOffX);
            new_off_y = scale_scale_coefficients.cy * (xfrm.offY - this.group.spPr.xfrm.chOffY);
            new_ext_x = scale_scale_coefficients.cx * xfrm.extX;
            new_ext_y = scale_scale_coefficients.cy * xfrm.extY;
        }
        var xfrm = this.spPr.xfrm;
        Math.abs(new_off_x - xfrm.offX) > MOVE_DELTA &&  xfrm.setOffX(new_off_x);
        Math.abs(new_off_y - xfrm.offY) > MOVE_DELTA &&  xfrm.setOffY(new_off_y);
        Math.abs(new_ext_x - xfrm.extX) > MOVE_DELTA &&  xfrm.setExtX(new_ext_x);
        Math.abs(new_ext_y - xfrm.extY) > MOVE_DELTA &&  xfrm.setExtY(new_ext_y);
    },

    check_bounds: function (checker) {
        if (this.spPr && this.spPr.geometry) {
            this.spPr.geometry.check_bounds(checker);
        }
        else {
            checker._s();
            checker._m(0, 0);
            checker._l(this.extX, 0);
            checker._l(this.extX, this.extY);
            checker._l(0, this.extY);
            checker._z();
            checker._e();
        }
    },

    getBase64Img: function ()
    {
        if(typeof this.cachedImage === "string")
        {
            return this.cachedImage;
        }
        if(!AscFormat.isRealNumber(this.x) || !AscFormat.isRealNumber(this.y) || !AscFormat.isRealNumber(this.extX) || !AscFormat.isRealNumber(this.extY))
            return "";
        var img_object = ShapeToImageConverter(this, this.pageIndex);
        if(img_object)
        {
            if(img_object.ImageNative)
            {
                try
                {
                    this.cachedPixW = img_object.ImageNative.width;
                    this.cachedPixH = img_object.ImageNative.height;
                }
                catch(e)
                {
                    this.cachedPixW = 50;
                    this.cachedPixH = 50;
                }
            }
            return img_object.ImageUrl;
        }
        else
        {

            return "";
        }
    },

    haveSelectedDrawingInContent: function()
    {
        if(this.bWordShape)
        {
            var aAllDrawings = this.recalcInfo.AllDrawings;
            for(var i = 0; i < aAllDrawings.length; ++i)
            {
                if(aAllDrawings[i] && aAllDrawings[i].GraphicObj && aAllDrawings[i].GraphicObj.selected)
                {
                    return true;
                }
            }
        }
        return false;
    },


    clipTextRect: function(graphics)
    {
        if(this.clipRect)
        {
            var clip_rect = this.clipRect;
            var oBodyPr = this.getBodyPr();
            if(!oBodyPr || !oBodyPr.upright)
            {
                graphics.transform3(this.transform);
                graphics.AddClipRect(clip_rect.x, clip_rect.y, clip_rect.w, clip_rect.h);

                graphics.SetIntegerGrid(false);
                graphics.transform3(this.transformText, true);
            }
            else
            {
                var oTransform = new CMatrix();
                var cX = this.transform.TransformPointX(this.extX/2, this.extY/2);
                var cY = this.transform.TransformPointY(this.extX/2, this.extY/2);

                if(checkNormalRotate(this.rot))
                {
                    oTransform.tx = cX - this.extX/2;
                    oTransform.ty = cY - this.extY/2;
                }
                else
                {
                    global_MatrixTransformer.TranslateAppend(oTransform, - this.extX/2, -this.extY/2);
                    global_MatrixTransformer.RotateRadAppend(oTransform, Math.PI/2);
                    global_MatrixTransformer.TranslateAppend(oTransform, cX, cY);
                }
                graphics.transform3(oTransform, true);
                graphics.AddClipRect(clip_rect.x, clip_rect.y, clip_rect.w, clip_rect.h);

                graphics.SetIntegerGrid(false);
                graphics.transform3(this.transformText, true);
            }
        }
    },

    draw: function (graphics, transform, transformText, pageIndex) {

        if(graphics.updatedRect && this.bounds)
        {
            var rect = graphics.updatedRect;
            var bounds = this.bounds;
            if(bounds.x > rect.x + rect.w
                || bounds.y > rect.y + rect.h
                || bounds.x + bounds.w < rect.x
                || bounds.y + bounds.h < rect.y)
                return;
        }
        var _transform = transform ? transform : this.transform;
        var _transform_text = transformText ? transformText : this.transformText;
        if (graphics.IsSlideBoundsCheckerType === true) {
            graphics.transform3(_transform);
            if (!this.spPr || null == this.spPr.geometry || this.spPr.geometry.pathLst.length === 0 || (this.spPr.geometry.pathLst.length === 1 && this.spPr.geometry.pathLst[0].ArrPathCommandInfo.length === 0) || !graphics.IsShapeNeedBounds(this.spPr.geometry.preset)) {
                graphics._s();
                graphics._m(0, 0);
                graphics._l(this.extX, 0);
                graphics._l(this.extX, this.extY);
                graphics._l(0, this.extY);
                graphics._e();
            }
            else {
                this.spPr.geometry.check_bounds(graphics);
            }

            if (this.txBody) {
                graphics.SetIntegerGrid(false);

                var transform_text;
                if ((!this.txBody.content || this.txBody.content.Is_Empty()) && this.txBody.content2 != null && !this.txBody.checkCurrentPlaceholder() && (this.isEmptyPlaceholder ? this.isEmptyPlaceholder() : false) && this.transformText2) {
                    transform_text = this.transformText2;
                }
                else if (this.txBody.content) {
                    transform_text = _transform_text;
                }

                graphics.transform3(transform_text);

                if (graphics.CheckUseFonts2 !== undefined)
                    graphics.CheckUseFonts2(transform_text);
                this.txBody.draw(graphics);
                if (graphics.UncheckUseFonts2 !== undefined)
                    graphics.UncheckUseFonts2(transform_text);
                graphics.SetIntegerGrid(true);
            }

            graphics.reset();
            return;
        }

        if (this.spPr && this.spPr.geometry || this.style || (this.brush && this.brush.fill) || (this.pen && this.pen.Fill && this.pen.Fill.fill)) {
            graphics.SetIntegerGrid(false);
            graphics.transform3(_transform, false);

            var shape_drawer = new CShapeDrawer();
            shape_drawer.fromShape2(this, graphics, this.spPr.geometry);
            shape_drawer.draw(this.spPr.geometry);
        }
        if (this.isEmptyPlaceholder() && graphics.IsNoDrawingEmptyPlaceholder !== true)
        {
            var drawingObjects = this.getDrawingObjectsController();
            if (graphics.m_oContext !== undefined && graphics.IsTrack === undefined && (!drawingObjects || AscFormat.getTargetTextObject(drawingObjects) !== this ))
            {
                if (global_MatrixTransformer.IsIdentity2(_transform))
                {
                    graphics.transform3(_transform, false);
                    var tr = graphics.m_oFullTransform;
                    graphics.SetIntegerGrid(true);

                    var _x = tr.TransformPointX(0, 0);
                    var _y = tr.TransformPointY(0, 0);
                    var _r = tr.TransformPointX(this.extX, this.extY);
                    var _b = tr.TransformPointY(this.extX, this.extY);

                    graphics.m_oContext.lineWidth = 1;
                    graphics.p_color(127, 127, 127, 255);

                    graphics._s();
                    editor.WordControl.m_oDrawingDocument.AutoShapesTrack.AddRectDashClever(graphics.m_oContext, _x >> 0, _y >> 0, _r >> 0, _b >> 0, 2, 2, true);
                    graphics._s();
                }
                else {
                    graphics.transform3(_transform, false);
                    var tr = graphics.m_oFullTransform;
                    graphics.SetIntegerGrid(true);

                    var _r = this.extX;
                    var _b = this.extY;

                    var x1 = tr.TransformPointX(0, 0) >> 0;
                    var y1 = tr.TransformPointY(0, 0) >> 0;

                    var x2 = tr.TransformPointX(_r, 0) >> 0;
                    var y2 = tr.TransformPointY(_r, 0) >> 0;

                    var x3 = tr.TransformPointX(0, _b) >> 0;
                    var y3 = tr.TransformPointY(0, _b) >> 0;

                    var x4 = tr.TransformPointX(_r, _b) >> 0;
                    var y4 = tr.TransformPointY(_r, _b) >> 0;

                    graphics.m_oContext.lineWidth = 1;
                    graphics.p_color(127, 127, 127, 255);

                    graphics._s();
                    editor.WordControl.m_oDrawingDocument.AutoShapesTrack.AddRectDash(graphics.m_oContext, x1, y1, x2, y2, x3, y3, x4, y4, 3, 1, true);
                    graphics._s();
                }
            }
            else
            {
                graphics.SetIntegerGrid(false);
                graphics.p_width(70);
                graphics.transform3(_transform, false);
                graphics.p_color(0, 0, 0, 255);
                graphics._s();
                graphics._m(0, 0);
                graphics._l(this.extX, 0);
                graphics._l(this.extX, this.extY);
                graphics._l(0, this.extY);
                graphics._z();
                graphics.ds();

                graphics.SetIntegerGrid(true);
            }
        }

        var oController = this.getDrawingObjectsController && this.getDrawingObjectsController();
        if(!this.txWarpStruct && !this.txWarpStructParamarksNoTransform || (!this.txWarpStructParamarksNoTransform && oController && (AscFormat.getTargetTextObject(oController) === this)) /*|| this.haveSelectedDrawingInContent()*/)
        {
            if (this.txBody)
            {
                graphics.SaveGrState();
                graphics.SetIntegerGrid(false);
                var transform_text;
                if ((!this.txBody.content || this.txBody.content.Is_Empty()) && this.txBody.content2 != null && !this.txBody.checkCurrentPlaceholder() && (this.isEmptyPlaceholder ? this.isEmptyPlaceholder() : false) && this.transformText2)
                {
                    transform_text = this.transformText2;
                }
                else if (this.txBody.content)
                {
                    transform_text = _transform_text;
                }

                if(this.worksheet && (this instanceof CShape) && !(oController && (AscFormat.getTargetTextObject(oController) === this)))
                {
                    this.clipTextRect(graphics);
                }
                graphics.transform3(this.transformText, true);
                if (graphics.CheckUseFonts2 !== undefined)
                    graphics.CheckUseFonts2(transform_text);

                graphics.SetIntegerGrid(true);
                this.txBody.draw(graphics);
                if (graphics.UncheckUseFonts2 !== undefined)
                    graphics.UncheckUseFonts2(transform_text);
                graphics.RestoreGrState();
            }

            if(this.textBoxContent && !graphics.IsNoSupportTextDraw && this.transformText)
            {
                var old_start_page = this.textBoxContent.Get_StartPage_Relative();
                this.textBoxContent.Set_StartPage(pageIndex);

                graphics.SaveGrState();
                graphics.SetIntegerGrid(false);
                this.clipTextRect(graphics);
                var result_page_index = AscFormat.isRealNumber(graphics.shapePageIndex) ? graphics.shapePageIndex : old_start_page;

                if (graphics.CheckUseFonts2 !== undefined)
                    graphics.CheckUseFonts2(this.transformText);

                if (window.IsShapeToImageConverter)
                {
                    this.textBoxContent.Set_StartPage(0);
                    result_page_index = 0;
                }


                this.textBoxContent.Set_StartPage(result_page_index);
                this.textBoxContent.Draw(result_page_index, graphics);

                if (graphics.UncheckUseFonts2 !== undefined)
                    graphics.UncheckUseFonts2();

                this.textBoxContent.Set_StartPage(old_start_page);
                graphics.RestoreGrState();
            }
        }
        else
        {
            var oTheme = this.getParentObjects().theme;
            var oColorMap = this.Get_ColorMap();
            if(!this.bWordShape && (!this.txBody.content || this.txBody.content.Is_Empty()) && this.txBody.content2 != null && !this.txBody.checkCurrentPlaceholder() && (this.isEmptyPlaceholder ? this.isEmptyPlaceholder() : false))
            {
				if (graphics.IsNoDrawingEmptyPlaceholder !== true && graphics.IsNoDrawingEmptyPlaceholderText !== true)
				{
					if(editor && editor.ShowParaMarks)
					{
						this.txWarpStructParamarks2.draw(graphics, this.transformTextWordArt2, oTheme, oColorMap);
					}
					else
					{
						this.txWarpStruct2.draw(graphics, this.transformTextWordArt2, oTheme, oColorMap);
					}
				}
            }
            else
            {

                var oContent = this.getDocContent();
                var result_page_index = AscFormat.isRealNumber(graphics.shapePageIndex) ? graphics.shapePageIndex : (oContent ? oContent.Get_StartPage_Relative() : 0);
                graphics.PageNum = result_page_index;
                var bNeedRestoreState = false;
                var bEditTextArt = isRealObject(oController) && (AscFormat.getTargetTextObject(oController) === this);
                if(this.bWordShape && this.clipRect /*&& (!this.bodyPr.prstTxWarp || this.bodyPr.prstTxWarp.preset === "textNoShape" || bEditTextArt)*/)
                {
                    bNeedRestoreState = true;
                    var clip_rect = this.clipRect;
                    if(!this.bodyPr.upright)
                    {
                        graphics.SaveGrState();
                        graphics.SetIntegerGrid(false);
                        graphics.transform3(this.transform);
                        graphics.AddClipRect(clip_rect.x, clip_rect.y, clip_rect.w, clip_rect.h);
                    }
                    else
                    {
                        graphics.SaveGrState();
                        graphics.SetIntegerGrid(false);
                        graphics.transform3(this.transformText, true);
                        graphics.AddClipRect(clip_rect.x, clip_rect.y, clip_rect.w, clip_rect.h);
                    }
                }

                var oTransform = this.transformTextWordArt;
                if(editor && editor.ShowParaMarks)
                {
                    if(bEditTextArt && this.txWarpStructParamarksNoTransform)
                    {
                        this.txWarpStructParamarksNoTransform.draw(graphics, this.transformText, oTheme, oColorMap);
                    }
                    else if(this.txWarpStructParamarks)
                    {
                        this.txWarpStructParamarks.draw(graphics, oTransform, oTheme, oColorMap);
                        if(this.checkNeedRecalcDocContentForTxWarp(this.bodyPr))
                        {
                            if(this.txWarpStructParamarksNoTransform)
                            {
                                this.txWarpStructParamarksNoTransform.drawComments(graphics, undefined, oTransform);
                            }
                        }
                    }
                }
                else
                {
                    if(bEditTextArt && this.txWarpStructNoTransform)
                    {
                        this.txWarpStructNoTransform.draw(graphics, this.transformText, oTheme, oColorMap);
                    }
                    else if(this.txWarpStruct)
                    {
                        this.txWarpStruct.draw(graphics, oTransform, oTheme, oColorMap);
                        if(this.checkNeedRecalcDocContentForTxWarp(this.bodyPr))
                        {
                            if(this.txWarpStructNoTransform)
                            {
                                this.txWarpStructNoTransform.drawComments(graphics, undefined, oTransform);
                            }
                        }
                    }
                }
                delete graphics.PageNum;
                if(bNeedRestoreState)
                {
                    graphics.RestoreGrState();
                }
            }
        }
        if(!this.group)
        {
            var oLock;
            if(this.parent instanceof ParaDrawing)
            {
                oLock = this.parent.Lock;
            }
            else if(this.Lock)
            {
                oLock = this.Lock;
            }
            if(oLock && AscCommon.locktype_None != oLock.Get_Type())
            {
                graphics.transform3(_transform);
                graphics.DrawLockObjectRect(oLock.Get_Type(), 0, 0, this.extX, this.extY);
            }
        }
        graphics.SetIntegerGrid(true);
        graphics.reset();
    },

    getRotateAngle: function (x, y) {
        var transform = this.getTransformMatrix();
        var rotate_distance = this.convertPixToMM(TRACK_DISTANCE_ROTATE);
        var hc = this.extX * 0.5;
        var vc = this.extY * 0.5;
        var xc_t = transform.TransformPointX(hc, vc);
        var yc_t = transform.TransformPointY(hc, vc);
        var rot_x_t = transform.TransformPointX(hc, -rotate_distance);
        var rot_y_t = transform.TransformPointY(hc, -rotate_distance);

        var invert_transform = this.getInvertTransform();
        var rel_x = invert_transform.TransformPointX(x, y);

        var v1_x, v1_y, v2_x, v2_y;
        v1_x = x - xc_t;
        v1_y = y - yc_t;

        v2_x = rot_x_t - xc_t;
        v2_y = rot_y_t - yc_t;

        var flip_h = this.getFullFlipH();
        var flip_v = this.getFullFlipV();
        var same_flip = flip_h && flip_v || !flip_h && !flip_v;
        var angle = rel_x > this.extX * 0.5 ? Math.atan2(Math.abs(v1_x * v2_y - v1_y * v2_x), v1_x * v2_x + v1_y * v2_y) : -Math.atan2(Math.abs(v1_x * v2_y - v1_y * v2_x), v1_x * v2_x + v1_y * v2_y);
        return same_flip ? angle : -angle;
    },

    getFullFlipH: function () {
        if (!isRealObject(this.group))
            return this.flipH;
        return this.group.getFullFlipH() ? !this.flipH : this.flipH;
    },

    getFullFlipV: function () {
        if (!isRealObject(this.group))
            return this.flipV;
        return this.group.getFullFlipV() ? !this.flipV : this.flipV;
    },

    getAspect: function (num) {
        var _tmp_x = this.extX != 0 ? this.extX : 0.1;
        var _tmp_y = this.extY != 0 ? this.extY : 0.1;
        return num === 0 || num === 4 ? _tmp_x / _tmp_y : _tmp_y / _tmp_x;
    },

    getFullRotate: function () {
        return !isRealObject(this.group) ? this.rot : this.rot + this.group.getFullRotate();
    },

    getRectBounds: function () {
        var transform = this.getTransformMatrix();
        var w = this.extX;
        var h = this.extY;
        var rect_points = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h}];
        var min_x, max_x, min_y, max_y;
        min_x = transform.TransformPointX(rect_points[0].x, rect_points[0].y);
        min_y = transform.TransformPointY(rect_points[0].x, rect_points[0].y);
        max_x = min_x;
        max_y = min_y;
        var cur_x, cur_y;
        for (var i = 1; i < 4; ++i) {
            cur_x = transform.TransformPointX(rect_points[i].x, rect_points[i].y);
            cur_y = transform.TransformPointY(rect_points[i].x, rect_points[i].y);
            if (cur_x < min_x)
                min_x = cur_x;
            if (cur_x > max_x)
                max_x = cur_x;

            if (cur_y < min_y)
                min_y = cur_y;
            if (cur_y > max_y)
                max_y = cur_y;
        }
        return { minX: min_x, maxX: max_x, minY: min_y, maxY: max_y };
    },

    getInvertTransform: function ()
    {
        return this.invertTransform ? this.invertTransform : new CMatrix();
    },

    calculateSnapArrays: function(snapArrayX, snapArrayY)
    {
        if(!Array.isArray(snapArrayX) || !Array.isArray(snapArrayX))
        {
            snapArrayX = this.snapArrayX;
            snapArrayY = this.snapArrayY;
            snapArrayX.length = 0;
            snapArrayY.length = 0;
        }
        var t = this.transform;
        snapArrayX.push(t.TransformPointX(0, 0));
        snapArrayY.push(t.TransformPointY(0, 0));
        snapArrayX.push(t.TransformPointX(this.extX, 0));
        snapArrayY.push(t.TransformPointY(this.extX, 0));

        snapArrayX.push(t.TransformPointX(this.extX*0.5, this.extY*0.5));
        snapArrayY.push(t.TransformPointY(this.extX*0.5, this.extY*0.5));
        snapArrayX.push(t.TransformPointX(this.extX, this.extY));
        snapArrayY.push(t.TransformPointY(this.extX, this.extY));
        snapArrayX.push(t.TransformPointX(0, this.extY));
        snapArrayY.push(t.TransformPointY(0, this.extY));
    },

    getFullOffset: function () {
        if (!isRealObject(this.group))
            return { offX: this.x, offY: this.y };
        var group_offset = this.group.getFullOffset();
        return { offX: this.x + group_offset.offX, offY: this.y + group_offset.offY };
    },

    getPresetGeom: function () {
        if (this.spPr && this.spPr.geometry) {
            return this.spPr.geometry.preset;
        }
        else {
            return null;
        }
    },

    getFill: function () {
        if(this.brush && this.brush.fill)
        {
            return this.brush;
        }
        return AscFormat.CreateNoFillUniFill();
    },

    getStroke: function () {
        if(this.pen && this.pen.Fill)
        {
            return this.pen;
        }
        var ret = AscFormat.CreateNoFillLine();
        ret.w = 0;
        return ret;
    },

    canChangeArrows: function () {
        if (!this.spPr || this.spPr.geometry == null) {
            return false;
        }
        var _path_list = this.spPr.geometry.pathLst;
        var _path_index;
        var _path_command_index;
        var _path_command_arr;
        for (_path_index = 0; _path_index < _path_list.length; ++_path_index) {
            _path_command_arr = _path_list[_path_index].ArrPathCommandInfo;
            for (_path_command_index = 0; _path_command_index < _path_command_arr.length; ++_path_command_index) {
                if (_path_command_arr[_path_command_index].id == 5) {
                    break;
                }
            }
            if (_path_command_index == _path_command_arr.length) {
                return true;
            }
        }
        return false;
    },

    getTextArtProperties: function()
    {
        var oContent = this.getDocContent(), oTextPr, oRet = null;
        if(oContent)
        {
            oRet = {Fill: undefined, Line: undefined, Form: undefined};
            var oController = this.getDrawingObjectsController();
           // if(oController)
            {
                //var oTargetDocContent = oController.getTargetDocContent();
                //if(oTargetDocContent === oContent)
                //{
                //    oTextPr = oContent.Get_Paragraph_TextPr();
                //}
                //else
                //{
                //    oContent.Set_ApplyToAll(true);
                //    oTextPr = oContent.Get_Paragraph_TextPr();
                //    oContent.Set_ApplyToAll(false);
                //}
                //if(oTextPr.TextFill)
                //{
                //    oRet.Fill = oTextPr.TextFill;
                //}
                //else if(oTextPr.Unifill)
                //{
                //    oRet.Fill = oTextPr.Unifill;
                //}
                //else if(oTextPr.Color)
                //{
                //    oRet.Fill = CreateUnfilFromRGB(oTextPr.Color.r, oTextPr.Color.g, oTextPr.Color.b);
                //}
                //oRet.Line = oTextPr.TextOutline;
                var oBodyPr = this.getBodyPr();
                if(oBodyPr && oBodyPr.prstTxWarp)
                {
                    oRet.Form = oBodyPr.prstTxWarp.preset;
                }
                else
                {
                    oRet.Form = "textNoShape";
                }
            }
        }
        return oRet;
    },

    applyTextArtForm: function(sPreset)
    {
        var oBodyPr = this.getBodyPr().createDuplicate();
        oBodyPr.prstTxWarp = AscFormat.ExecuteNoHistory(function(){return AscFormat.CreatePrstTxWarpGeometry(sPreset)}, this, []);
        if(this.bWordShape)
        {
            this.setBodyPr(oBodyPr);
        }
        else
        {
            if(this.txBody)
            {
                this.txBody.setBodyPr(oBodyPr);
            }
        }
    },

    getParagraphParaPr: function () {
        if (this.txBody && this.txBody.content) {
            var _result;
            this.txBody.content.Set_ApplyToAll(true);
            _result = this.txBody.content.Get_Paragraph_ParaPr();
            this.txBody.content.Set_ApplyToAll(false);
            return _result;
        }
        return null;
    },

    getParagraphTextPr: function () {
        if (this.txBody && this.txBody.content) {
            var _result;
            this.txBody.content.Set_ApplyToAll(true);
            _result = this.txBody.content.Get_Paragraph_TextPr();
            this.txBody.content.Set_ApplyToAll(false);
            return _result;
        }
        return null;
    },

    getAllRasterImages: function(images)
    {
        if(this.spPr && this.spPr.Fill && this.spPr.Fill.fill && typeof (this.spPr.Fill.fill.RasterImageId) === "string" && this.spPr.Fill.fill.RasterImageId.length > 0)
            images.push(this.spPr.Fill.fill.RasterImageId);


        var compiled_style = this.getCompiledStyle();
        var parents = this.getParentObjects();
        if (isRealObject(parents.theme) && isRealObject(compiled_style) && isRealObject(compiled_style.fillRef))
        {
            var brush = parents.theme.getFillStyle(compiled_style.fillRef.idx, compiled_style.fillRef.Color);
            if(brush && brush.fill && typeof (brush.fill.RasterImageId) === "string" && brush.fill.RasterImageId.length > 0)
            {
                images.push(brush.fill.RasterImageId);
            }
        }
        var oContent = this.getDocContent();
        if(oContent)
        {
            if(this.bWordShape)
            {
                var drawings = oContent.Get_AllDrawingObjects();
                for(var i = 0; i < drawings.length; ++i)
                {
                    drawings[i].GraphicObj && drawings[i].GraphicObj.getAllRasterImages && drawings[i].GraphicObj.getAllRasterImages(images);
                }
            }
            var fCallback = function(oTextPr)
            {
                if( (oTextPr.Unifill && oTextPr.Unifill.fill && oTextPr.Unifill.fill.type == c_oAscFill.FILL_TYPE_BLIP))
                {
                    images.push(oTextPr.Unifill.fill.RasterImageId);
                }
                return false;
            }
            this.checkContentByCallback(oContent, fCallback);
        }
    },

    changePresetGeom: function (sPreset) {


        if(sPreset === "textRect")
        {
            this.spPr.setGeometry(AscFormat.CreateGeometry("rect"));
            this.spPr.geometry.setParent(this.spPr);
            this.setStyle(AscFormat.CreateDefaultTextRectStyle());
            var fill = new AscFormat.CUniFill();
            fill.setFill(new AscFormat.CSolidFill());
            fill.fill.setColor(new AscFormat.CUniColor());
            fill.fill.color.setColor(new AscFormat.CSchemeColor());
            fill.fill.color.color.setId(12);
            this.spPr.setFill(fill);

            var ln = new AscFormat.CLn();
            ln.setW(6350);
            ln.setFill(new AscFormat.CUniFill());
            ln.Fill.setFill(new AscFormat.CSolidFill());
            ln.Fill.fill.setColor(new AscFormat.CUniColor());
            ln.Fill.fill.color.setColor(new AscFormat.CPrstColor());
            ln.Fill.fill.color.color.setId("black");
            this.spPr.setLn(ln);
            if(this.bWordShape)
            {
                if(!this.textBoxContent)
                {
                    this.setTextBoxContent(new CDocumentContent(this, this.getDrawingDocument(), 0, 0, 0, 0, false, false, false));
                    var body_pr = new AscFormat.CBodyPr();
                    body_pr.setDefault();
                    this.setBodyPr(body_pr);
                }
            }
            else
            {
                if(!this.txBody)
                {
                    this.setTxBody(new AscFormat.CTextBody());
                    var content = new CDocumentContent(this.txBody, this.getDrawingDocument(), 0, 0, 0, 0, false, false, true);
                    this.txBody.setParent(this);
                    this.txBody.setContent(content);
                    var body_pr = new AscFormat.CBodyPr();
                    body_pr.setDefault();
                    this.txBody.setBodyPr(body_pr);
                }
            }
            return;
        }
        var _final_preset;
        var _old_line;
        var _new_line;


        if (this.spPr.ln == null) {
            _old_line = null;
        }
        else {
            _old_line = this.spPr.ln.createDuplicate();
        }
        switch (sPreset) {
            case "lineWithArrow":
            {
                _final_preset = "line";
                if (_old_line == null) {
                    _new_line = new AscFormat.CLn();
                }
                else {
                    _new_line = this.spPr.ln.createDuplicate();
                }
                _new_line.tailEnd = new AscFormat.EndArrow();
                _new_line.tailEnd.type = AscFormat.LineEndType.Arrow;
                _new_line.tailEnd.len = AscFormat.LineEndSize.Mid;
                _new_line.tailEnd.w = AscFormat.LineEndSize.Mid;
                break;
            }
            case "lineWithTwoArrows":
            {
                _final_preset = "line";
                if (_old_line == null) {
                    _new_line = new AscFormat.CLn();

                }
                else {
                    _new_line = this.spPr.ln.createDuplicate();
                }
                _new_line.tailEnd = new AscFormat.EndArrow();
                _new_line.tailEnd.type = AscFormat.LineEndType.Arrow;
                _new_line.tailEnd.len = AscFormat.LineEndSize.Mid;
                _new_line.tailEnd.w = AscFormat.LineEndSize.Mid;

                _new_line.headEnd = new AscFormat.EndArrow();
                _new_line.headEnd.type = AscFormat.LineEndType.Arrow;
                _new_line.headEnd.len = AscFormat.LineEndSize.Mid;
                _new_line.headEnd.w = AscFormat.LineEndSize.Mid;
                break;
            }
            case "bentConnector5WithArrow":
            {
                _final_preset = "bentConnector5";
                if (_old_line == null) {
                    _new_line = new AscFormat.CLn();

                }
                else {
                    _new_line = this.spPr.ln.createDuplicate();
                }
                _new_line.tailEnd = new AscFormat.EndArrow();
                _new_line.tailEnd.type = AscFormat.LineEndType.Arrow;
                _new_line.tailEnd.len = AscFormat.LineEndSize.Mid;
                _new_line.tailEnd.w = AscFormat.LineEndSize.Mid;
                break;
            }
            case "bentConnector5WithTwoArrows":
            {
                _final_preset = "bentConnector5";
                if (_old_line == null) {
                    _new_line = new AscFormat.CLn();
                }
                else {
                    _new_line = this.spPr.ln.createDuplicate();
                }
                _new_line.tailEnd = new AscFormat.EndArrow();
                _new_line.tailEnd.type = AscFormat.LineEndType.Arrow;
                _new_line.tailEnd.len = AscFormat.LineEndSize.Mid;
                _new_line.tailEnd.w = AscFormat.LineEndSize.Mid;

                _new_line.headEnd = new AscFormat.EndArrow();
                _new_line.headEnd.type = AscFormat.LineEndType.Arrow;
                _new_line.headEnd.len = AscFormat.LineEndSize.Mid;
                _new_line.headEnd.w = AscFormat.LineEndSize.Mid;
                break;
            }
            case "curvedConnector3WithArrow":
            {
                _final_preset = "curvedConnector3";
                if (_old_line == null) {
                    _new_line = new AscFormat.CLn();
                }
                else {
                    _new_line = this.spPr.ln.createDuplicate();
                }
                _new_line.tailEnd = new AscFormat.EndArrow();
                _new_line.tailEnd.type = AscFormat.LineEndType.Arrow;
                _new_line.tailEnd.len = AscFormat.LineEndSize.Mid;
                _new_line.tailEnd.w = AscFormat.LineEndSize.Mid;
                break;
            }
            case "curvedConnector3WithTwoArrows":
            {
                _final_preset = "curvedConnector3";
                if (_old_line == null) {
                    _new_line = new AscFormat.CLn();

                }
                else {
                    _new_line = this.spPr.ln.createDuplicate();
                }
                _new_line.tailEnd = new AscFormat.EndArrow();
                _new_line.tailEnd.type = AscFormat.LineEndType.Arrow;
                _new_line.tailEnd.len = AscFormat.LineEndSize.Mid;
                _new_line.tailEnd.w = AscFormat.LineEndSize.Mid;

                _new_line.headEnd = new AscFormat.EndArrow();
                _new_line.headEnd.type = AscFormat.LineEndType.Arrow;
                _new_line.headEnd.len = AscFormat.LineEndSize.Mid;
                _new_line.headEnd.w = AscFormat.LineEndSize.Mid;
                break;
            }
            default:
            {
                _final_preset = sPreset;
                if (_old_line == null) {
                    _new_line = new AscFormat.CLn();
                }
                else {
                    _new_line = this.spPr.ln.createDuplicate();
                }
                _new_line.tailEnd = null;

                _new_line.headEnd = null;
                break;
            }
        }
        if (_final_preset != null) {
            this.spPr.setGeometry(AscFormat.CreateGeometry(_final_preset));
            if(this.spPr.geometry)
            {
                this.spPr.geometry.setParent(this.spPr);
            }
        }
        else {
            this.spPr.geometry = null;
        }
        if(!this.bWordShape)
        {
            this.checkExtentsByDocContent();
        }
        if ((!this.brush || !this.brush.fill) && (!this.pen || !this.pen.Fill || !this.pen.Fill.fill)) {
            var new_line2 = new AscFormat.CLn();
            new_line2.Fill = new AscFormat.CUniFill();
            new_line2.Fill.fill = new AscFormat.CSolidFill();
            new_line2.Fill.fill.color = new AscFormat.CUniColor();
            new_line2.Fill.fill.color.color = new AscFormat.CSchemeColor();
            new_line2.Fill.fill.color.color.id = 0;
            if (isRealObject(_new_line)) {
                new_line2.merge(_new_line);
            }
            this.spPr.setLn(new_line2);
        }
        else
            this.spPr.setLn(_new_line);
    },

    changeFill: function (unifill) {

        if(this.recalcInfo.recalculateBrush)
        {
            this.recalculateBrush();
        }
        var unifill2 = AscFormat.CorrectUniFill(unifill, this.brush);
        unifill2.convertToPPTXMods();
        this.spPr.setFill(unifill2);
    },
    setFill: function (fill) {

        this.spPr.setFill(fill);
    },

    changeLine: function (line)
    {
        if(this.recalcInfo.recalculatePen)
        {
            this.recalculatePen();
        }
        var stroke = AscFormat.CorrectUniStroke(line, this.pen);
        if(stroke.Fill)
        {
            stroke.Fill.convertToPPTXMods();
        }
        this.spPr.setLn(stroke);
    },

    hitToAdjustment: function (x, y) {
        var invert_transform = this.getInvertTransform();
        var t_x, t_y, ret;
        t_x = invert_transform.TransformPointX(x, y);
        t_y = invert_transform.TransformPointY(x, y);
        if (this.spPr && isRealObject(this.spPr.geometry))
        {
            invert_transform = this.getInvertTransform();
            t_x = invert_transform.TransformPointX(x, y);
            t_y = invert_transform.TransformPointY(x, y);
            ret = this.spPr.geometry.hitToAdj(t_x, t_y, this.convertPixToMM(global_mouseEvent.KoefPixToMM * TRACK_CIRCLE_RADIUS));
            if(ret.hit)
            {
                ret.warp = false;
                return ret;
            }
        }
        if(this.recalcInfo.warpGeometry)
        {
            invert_transform = this.invertTransformTextWordArt;
            t_x = invert_transform.TransformPointX(x, y);
            t_y = invert_transform.TransformPointY(x, y);
            ret = this.recalcInfo.warpGeometry.hitToAdj(t_x, t_y, this.convertPixToMM(global_mouseEvent.KoefPixToMM * TRACK_CIRCLE_RADIUS));
            ret.warp = true;
            return ret;
        }

        return { hit: false, adjPolarFlag: null, adjNum: null, warp: false };
    },

    hitToHandles: function (x, y) {
        return hitToHandles(x, y, this);

    },

    hit: function (x, y) {
        return this.hitInInnerArea(x, y) || this.hitInPath(x, y) || this.hitInTextRect(x, y);
    },

    hitInPath: function (x, y) {
        if(!this.checkHitToBounds(x, y))
            return;
        var invert_transform = this.getInvertTransform();
        var x_t = invert_transform.TransformPointX(x, y);
        var y_t = invert_transform.TransformPointY(x, y);
        if (isRealObject(this.spPr) && isRealObject(this.spPr.geometry))
            return this.spPr.geometry.hitInPath(this.getCanvasContext(), x_t, y_t);
        else
            return this.hitInBoundingRect(x, y);
        return false;
    },

    hitInInnerArea: function (x, y) {
        if ((this.getObjectType && this.getObjectType() === AscDFH.historyitem_type_ChartSpace) || this.brush != null && this.brush.fill != null
            && this.brush.fill.type != c_oAscFill.FILL_TYPE_NOFILL && this.checkHitToBounds(x, y)) {
            var invert_transform = this.getInvertTransform();
            var x_t = invert_transform.TransformPointX(x, y);
            var y_t = invert_transform.TransformPointY(x, y);
            if (isRealObject(this.spPr) && isRealObject(this.spPr.geometry) && this.spPr.geometry.pathLst.length > 0 && !(this.getObjectType && this.getObjectType() === AscDFH.historyitem_type_ChartSpace))
                return this.spPr.geometry.hitInInnerArea(this.getCanvasContext(), x_t, y_t);
            return x_t > 0 && x_t < this.extX && y_t > 0 && y_t < this.extY;
        }
        return false;
    },

    hitInBoundingRect: function (x, y) {
        var invert_transform = this.getInvertTransform();
        var x_t = invert_transform.TransformPointX(x, y);
        var y_t = invert_transform.TransformPointY(x, y);

        var _hit_context = this.getCanvasContext();

        return !(CheckObjectLine(this)) && (HitInLine(_hit_context, x_t, y_t, 0, 0, this.extX, 0) ||
            HitInLine(_hit_context, x_t, y_t, this.extX, 0, this.extX, this.extY) ||
            HitInLine(_hit_context, x_t, y_t, this.extX, this.extY, 0, this.extY) ||
            HitInLine(_hit_context, x_t, y_t, 0, this.extY, 0, 0) ||
            (this.canRotate && this.canRotate() && HitInLine(_hit_context, x_t, y_t, this.extX * 0.5, 0, this.extX * 0.5, -this.convertPixToMM(TRACK_DISTANCE_ROTATE))));
    },

    canRotate: function () {
        return true;
    },

    canResize: function () {
        return true; //TODO
    },

    canMove: function () {
        return true; //TODO
    },

    canGroup: function () {
        return !this.isPlaceholder(); //TODO
    },

    getBoundsInGroup: function () {
        var r = this.rot;
        if (!AscFormat.isRealNumber(r) || checkNormalRotate(r)) {
            return { minX: this.x, minY: this.y, maxX: this.x + this.extX, maxY: this.y + this.extY };
        }
        else {
            var hc = this.extX * 0.5;
            var vc = this.extY * 0.5;
            var xc = this.x + hc;
            var yc = this.y + vc;
            return { minX: xc - vc, minY: yc - hc, maxX: xc + vc, maxY: yc + hc };
        }
    },

    canChangeAdjustments: function () {
        return true; //TODO
    },

    createRotateTrack: function () {
        return new AscFormat.RotateTrackShapeImage(this);
    },

    createResizeTrack: function (cardDirection) {
        return new AscFormat.ResizeTrackShapeImage(this, cardDirection);
    },

    createMoveTrack: function () {
        return new AscFormat.MoveShapeImageTrack(this);
    },


    remove: function (Count, bOnlyText, bRemoveOnlySelection) {
        if (this.txBody) {
            this.txBody.content.Remove(Count, bOnlyText, bRemoveOnlySelection);
            this.recalcInfo.recalculateContent = true;
            this.recalcInfo.recalculateTransformText = true;
        }
    },


    Restart_CheckSpelling: function()
    {
        this.recalcInfo.recalculateShapeStyleForParagraph = true;
        var content = this.getDocContent();
        content && content.Restart_CheckSpelling();
    },

    Refresh_RecalcData: function (data)
    {
        switch (data.Type)
        {
            case AscDFH.historyitem_AutoShapes_SetDrawingBaseCoors:
            {
                break;
            }
            case AscDFH.historyitem_AutoShapes_RemoveFromDrawingObjects:
            {
                break;
            }

            case AscDFH.historyitem_AutoShapes_AddToDrawingObjects:
            {
                break;
            }
            case AscDFH.historyitem_AutoShapes_SetWorksheet:
            {
                break;
            }
            case AscDFH.historyitem_ShapeSetBDeleted:
            {
                break;
            }
            case AscDFH.historyitem_ShapeSetNvSpPr:
            {
                break;
            }
            case AscDFH.historyitem_ShapeSetSpPr:
            {
                break;
            }
            case AscDFH.historyitem_ShapeSetStyle:
            {
                break;
            }
            case AscDFH.historyitem_ShapeSetTxBody:
            {
                break;
            }
            case AscDFH.historyitem_ShapeSetTextBoxContent:
            {
                break;
            }
            case AscDFH.historyitem_ShapeSetParent:
            {
                break;
            }
            case AscDFH.historyitem_ShapeSetGroup:
            {
                break;
            }
            case AscDFH.historyitem_ShapeSetBodyPr:
            {
                break;
            }
            case AscDFH.historyitem_ShapeSetWordShape:
            {
                break;
            }
            default:
            {
                this.Refresh_RecalcData2();
            }
        }
    },

    Refresh_RecalcData2: function(pageIndex/*для текста*/)
    {
        this.recalcContent();
        this.recalcContent2 && this.recalcContent2();
        this.recalcTransformText();
        this.addToRecalculate();
        var oController = this.getDrawingObjectsController();
        if(oController && AscFormat.getTargetTextObject(oController) === this)
        {
            this.recalcInfo.recalcTitle = this.getDocContent();
            this.recalcInfo.bRecalculatedTitle = true;
        }
    },

    Undo: function (data)
    {
        switch (data.Type)
        {
            case AscDFH.historyitem_AutoShapes_SetBFromSerialize:
            {
                this.fromSerialize = data.oldPr;
                break;
            }
            case AscDFH.historyitem_AutoShapes_SetDrawingBaseCoors:
            {
                if(this.drawingBase)
                {
                    this.drawingBase.from.col    = data.oldFromCol;
                    this.drawingBase.from.colOff = data.oldFromColOff;
                    this.drawingBase.from.row    = data.oldFromRow;
                    this.drawingBase.from.rowOff = data.oldFromRowOff;
                    this.drawingBase.to.col      = data.oldToCol;
                    this.drawingBase.to.colOff   = data.oldToColOff;
                    this.drawingBase.to.row      = data.oldToRow;
                    this.drawingBase.to.rowOff   = data.oldToRowOff;
                    this.drawingBase.Pos.X       = data.oldPosX;
                    this.drawingBase.Pos.Y       = data.oldPosY;
                    this.drawingBase.ext.cx      = data.oldCx;
                    this.drawingBase.ext.cy      = data.oldCy;
                }
                break;
            }
            case AscDFH.historyitem_AutoShapes_RemoveFromDrawingObjects:
            {
                addToDrawings(this.worksheet, this, data.Pos);
                break;
            }

            case AscDFH.historyitem_AutoShapes_AddToDrawingObjects:
            {
                deleteDrawingBase(this.worksheet.Drawings, this.Get_Id());
                break;
            }
            case AscDFH.historyitem_AutoShapes_SetWorksheet:
            {
                this.worksheet = data.oldPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetBDeleted:
            {
                this.bDeleted = data.oldPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetNvSpPr:
            {
                this.nvSpPr = data.oldPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetSpPr:
            {
                this.spPr = data.oldPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetStyle:
            {
                this.style = data.oldPr;


                this.recalcInfo.recalculateShapeStyleForParagraph = true;
                if(this.recalcTextStyles)
                    this.recalcTextStyles();
                var content = this.getDocContent();
                if(content)
                {
                    content.Recalc_AllParagraphs_CompiledPr();
                }
                break;
            }
            case AscDFH.historyitem_ShapeSetTxBody:
            {
                this.txBody = data.oldPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetTextBoxContent:
            {
                this.textBoxContent = data.oldPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetParent:
            {
                this.parent = data.oldPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetGroup:
            {
                this.group = data.oldPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetBodyPr:
            {
                this.bodyPr = data.oldPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetWordShape:
            {
                this.bWordShape = data.oldPr;
                break;
            }
        }
    },

    Redo: function (data)
    {
        switch (data.Type)
        {
            case AscDFH.historyitem_AutoShapes_SetBFromSerialize:
            {
                this.fromSerialize = data.newPr;
                break;
            }
            case AscDFH.historyitem_AutoShapes_SetDrawingBaseCoors:
            {
                if(this.drawingBase)
                {
                    this.drawingBase.from.col    = data.fromCol;
                    this.drawingBase.from.colOff = data.fromColOff;
                    this.drawingBase.from.row    = data.fromRow;
                    this.drawingBase.from.rowOff = data.fromRowOff;
                    this.drawingBase.to.col      = data.toCol;
                    this.drawingBase.to.colOff   = data.toColOff;
                    this.drawingBase.to.row      = data.toRow;
                    this.drawingBase.to.rowOff   = data.toRowOff;
                    this.drawingBase.Pos.X       = data.posX;
                    this.drawingBase.Pos.Y       = data.posY;
                    this.drawingBase.ext.cx      = data.cx;
                    this.drawingBase.ext.cy      = data.cy;
                }
                break;
            }
            case AscDFH.historyitem_AutoShapes_RemoveFromDrawingObjects:
            {
                deleteDrawingBase(this.worksheet.Drawings, this.Get_Id());
                break;
            }
            case AscDFH.historyitem_AutoShapes_AddToDrawingObjects:
            {
                addToDrawings(this.worksheet, this, data.Pos);
                break;
            }
            case AscDFH.historyitem_AutoShapes_SetWorksheet:
            {
                this.worksheet = data.newPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetBDeleted:
            {
                this.bDeleted = data.newPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetNvSpPr:
            {
                this.nvSpPr = data.newPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetSpPr:
            {
                this.spPr = data.newPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetStyle:
            {
                this.style = data.newPr;
                var content = this.getDocContent();

                this.recalcInfo.recalculateShapeStyleForParagraph = true;
                if(this.recalcTextStyles)
                    this.recalcTextStyles();
                if(content)
                {
                    content.Recalc_AllParagraphs_CompiledPr();
                }
                break;
            }
            case AscDFH.historyitem_ShapeSetTxBody:
            {
                this.txBody = data.newPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetTextBoxContent:
            {
                this.textBoxContent = data.newPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetParent:
            {
                this.parent = data.newPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetGroup:
            {
                this.group = data.newPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetBodyPr:
            {
                this.bodyPr = data.newPr;
                break;
            }
            case AscDFH.historyitem_ShapeSetWordShape:
            {
                this.bWordShape = data.newPr;
                break;
            }
        }
    },

    Save_Changes: function (data, w)
    {
        w.WriteLong(this.getObjectType());
        w.WriteLong(data.Type);
        switch (data.Type)
        {
            case AscDFH.historyitem_AutoShapes_SetBFromSerialize:
            {
                AscFormat.writeBool(w, data.newPr);
                break;
            }
            case AscDFH.historyitem_AutoShapes_SetDrawingBaseCoors:
            {
                AscFormat.writeDouble(w, data.fromCol   );
                AscFormat.writeDouble(w, data.fromColOff);
                AscFormat.writeDouble(w, data.fromRow   );
                AscFormat.writeDouble(w, data.fromRowOff);
                AscFormat.writeDouble(w, data.toCol);
                AscFormat.writeDouble(w, data.toColOff);
                AscFormat.writeDouble(w, data.toRow   );
                AscFormat.writeDouble(w, data.toRowOff);

                AscFormat.writeDouble(w, data.posX);
                AscFormat.writeDouble(w, data.posY);
                AscFormat.writeDouble(w, data.cx);
                AscFormat.writeDouble(w, data.cy);

                break;
            }
            case AscDFH.historyitem_AutoShapes_RemoveFromDrawingObjects:
            {
                break;
            }
            case AscDFH.historyitem_AutoShapes_AddToDrawingObjects:
            {
                var Pos = data.UseArray ? data.PosArray[0] : data.Pos;
                AscFormat.writeLong(w, Pos);
                break;
            }
            case AscDFH.historyitem_AutoShapes_SetWorksheet:
            {
                AscFormat.writeBool(w, isRealObject(data.newPr));
                if(isRealObject(data.newPr))
                {
                    AscFormat.writeString(w, data.newPr.getId());
                }
                break;
            }
            case AscDFH.historyitem_ShapeSetNvSpPr:
            case AscDFH.historyitem_ShapeSetSpPr:
            case AscDFH.historyitem_ShapeSetStyle:
            case AscDFH.historyitem_ShapeSetTxBody:
            case AscDFH.historyitem_ShapeSetTextBoxContent:
            case AscDFH.historyitem_ShapeSetParent:
            case AscDFH.historyitem_ShapeSetGroup:
            {
                AscFormat.writeObject(w, data.newPr);
                break;
            }
            case AscDFH.historyitem_ShapeSetBodyPr:
            {
                w.WriteBool(isRealObject(data.newPr));
                if(isRealObject(data.newPr))
                {
                   data.newPr.Write_ToBinary(w);
                }
                break;
            }
            case AscDFH.historyitem_ShapeSetWordShape:

            case AscDFH.historyitem_ShapeSetBDeleted:
            {
                AscFormat.writeBool(w, data.newPr);
                break;
            }
        }
    },

    Load_Changes: function (r)
    {
        if (r.GetLong() === this.getObjectType())
        {
            var type = r.GetLong();
            switch (type)
            {
                case AscDFH.historyitem_AutoShapes_SetBFromSerialize:
                {
                    this.fromSerialize = AscFormat.readBool(r);
                    break;
                }
                case AscDFH.historyitem_AutoShapes_SetDrawingBaseCoors:
                {
                    if(this.drawingBase)
                    {
                        this.drawingBase.from.col    = AscFormat.readDouble(r);
                        this.drawingBase.from.colOff = AscFormat.readDouble(r);
                        this.drawingBase.from.row    = AscFormat.readDouble(r);
                        this.drawingBase.from.rowOff = AscFormat.readDouble(r);
                        this.drawingBase.to.col      = AscFormat.readDouble(r);
                        this.drawingBase.to.colOff   = AscFormat.readDouble(r);
                        this.drawingBase.to.row      = AscFormat.readDouble(r);
                        this.drawingBase.to.rowOff   = AscFormat.readDouble(r);

                        this.drawingBase.Pos.X = AscFormat.readDouble(r);
                        this.drawingBase.Pos.Y = AscFormat.readDouble(r);
                        this.drawingBase.ext.cx = AscFormat.readDouble(r);
                        this.drawingBase.ext.cy = AscFormat.readDouble(r);

                    }
                    break;
                }
                case AscDFH.historyitem_AutoShapes_RemoveFromDrawingObjects:
                {
                    deleteDrawingBase(this.worksheet.Drawings, this.Get_Id());
                    break;
                }
                case AscDFH.historyitem_AutoShapes_AddToDrawingObjects:
                {
                    var pos = AscFormat.readLong(r);
                    if(this.worksheet)
                    {
                        pos = this.worksheet.contentChanges.Check(AscCommon.contentchanges_Add, pos);
                    }
                    addToDrawings(this.worksheet, this, pos);
                    break;
                }
                case AscDFH.historyitem_AutoShapes_SetWorksheet:
                {
                    AscFormat.ReadWBModel(this, r);
                    break;
                }
                case AscDFH.historyitem_ShapeSetBDeleted:
                {
                    this.bDeleted = AscFormat.readBool(r);
                    break;
                }
                case AscDFH.historyitem_ShapeSetNvSpPr:
                {
                    this.nvSpPr = AscFormat.readObject(r);
                    break;
                }
                case AscDFH.historyitem_ShapeSetSpPr:
                {
                    this.spPr = AscFormat.readObject(r);
                    break;
                }
                case AscDFH.historyitem_ShapeSetStyle:
                {
                    this.style = AscFormat.readObject(r);
                    var content = this.getDocContent();

                    this.recalcInfo.recalculateShapeStyleForParagraph = true;
                    if(this.recalcTextStyles)
                        this.recalcTextStyles();
                    if(content)
                    {
                        content.Recalc_AllParagraphs_CompiledPr();
                    }
                    break;
                }
                case AscDFH.historyitem_ShapeSetTxBody:
                {
                    this.txBody = AscFormat.readObject(r);
                    break;
                }
                case AscDFH.historyitem_ShapeSetTextBoxContent:
                {
                    this.textBoxContent = AscFormat.readObject(r);
                    break;
                }
                case AscDFH.historyitem_ShapeSetParent:
                {
                    this.parent = AscFormat.readObject(r);
                    break;
                }
                case AscDFH.historyitem_ShapeSetGroup:
                {
                    this.group = AscFormat.readObject(r);
                    break;
                }
                case AscDFH.historyitem_ShapeSetBodyPr:
                {
                    if(r.GetBool())
                    {
                        this.bodyPr = new AscFormat.CBodyPr();
                        this.bodyPr.Read_FromBinary(r);
                    }
                    else
                    {
                        this.bodyPr = null;
                    }
                    break;
                }
                case AscDFH.historyitem_ShapeSetWordShape:
                {
                    this.bWordShape = AscFormat.readBool(r);
                    break;
                }
            }
        }
    },

    Load_LinkData: function (linkData)
    {
    },

    Get_PageContentStartPos: function(pageNum)
    {
        if(this.textBoxContent)
        {
            if(this.spPr && this.spPr.geometry && this.spPr.geometry.rect)
            {
                var rect = this.spPr.geometry.rect;
                return {X: 0, Y: 0, XLimit: rect.r - rect.l, YLimit: 20000};
            }
            else
            {
                return {X: 0, Y: 0, XLimit: this.extX, YLimit: 20000};
            }
        }
        return null;
    },

    OnContentRecalculate: function()
    {},

    recalculateBounds: function()
    {
        var boundsChecker = new  AscFormat.CSlideBoundsChecker();
        this.draw(boundsChecker, this.localTransform, this.localTransformText);
        if(!this.group)
        {
            var tr = this.localTransform;
            var arr_p_x = [];
            var arr_p_y = [];
            arr_p_x.push(tr.TransformPointX(0,0));
            arr_p_y.push(tr.TransformPointY(0,0));
            arr_p_x.push(tr.TransformPointX(this.extX,0));
            arr_p_y.push(tr.TransformPointY(this.extX,0));
            arr_p_x.push(tr.TransformPointX(this.extX,this.extY));
            arr_p_y.push(tr.TransformPointY(this.extX,this.extY));
            arr_p_x.push(tr.TransformPointX(0,this.extY));
            arr_p_y.push(tr.TransformPointY(0,this.extY));

            arr_p_x.push(boundsChecker.Bounds.min_x);
            arr_p_x.push(boundsChecker.Bounds.max_x);
            arr_p_y.push(boundsChecker.Bounds.min_y);
            arr_p_y.push(boundsChecker.Bounds.max_y);

            var min_b_x = Math.min.apply(Math, arr_p_x);
            var max_b_x = Math.max.apply(Math, arr_p_x);
            var min_b_y = Math.min.apply(Math, arr_p_y);
            var max_b_y = Math.max.apply(Math, arr_p_y);

            this.bounds.l = min_b_x;
            this.bounds.t = min_b_y;
            this.bounds.r = max_b_x;
            this.bounds.b = max_b_y;
        }
        else
        {

            this.bounds.l = boundsChecker.Bounds.min_x;
            this.bounds.t = boundsChecker.Bounds.min_y;
            this.bounds.r = boundsChecker.Bounds.max_x;
            this.bounds.b = boundsChecker.Bounds.max_y;
        }


        this.bounds.x = this.bounds.l;
        this.bounds.y = this.bounds.t;
        this.bounds.w = this.bounds.r - this.bounds.l;
        this.bounds.h = this.bounds.b - this.bounds.t;
    },

    checkRunWordArtContent: function(aContent, fCallback)
    {
        for(var j = 0; j < aContent.length; ++j)
        {
            if(aContent[j].Type === para_Run)
            {
                if(fCallback(aContent[j]))
                {
                    return true;
                }
            }
            else if(aContent[j].Type === para_Hyperlink)
            {
                if(this.checkRunWordArtContent(aContent[j].Content, fCallback))
                {
                    return true;
                }
            }
        }
        return false;
    },

    checkContentByCallback: function(oContent, fCallback)
    {
        if(!oContent)
            return false;
        var i, j, k, oElement, aRows, oRow;
        for(i = 0; i < oContent.Content.length; ++i)
        {
            oElement = oContent.Content[i];
            if(oElement.Get_Type() === type_Paragraph)
            {
                if(this.checkRunWordArtContent(oElement.Content, fCallback))
                {
                    return true;
                }
            }
            else if(oElement.Get_Type() === type_Table)
            {
                aRows = oElement.Content;
                for(j = 0; j < aRows.length; ++j)
                {
                    oRow = aRows[j];
                    for(k = 0; k < oRow.Content.length; ++k)
                    {
                        if(this.checkContentByCallback(oRow.Content[k].Content, fCallback))
                        {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    },

    checkContentWordArt: function(oContent)
    {
        return this.checkContentByCallback(oContent, CheckWordArtTextPr);
    },

    checkNeedRecalcDocContentForTxWarp: function(oBodyPr)
    {
        return oBodyPr && oBodyPr.prstTxWarp && (oBodyPr.prstTxWarp.pathLst.length / 2 - ((oBodyPr.prstTxWarp.pathLst.length / 2) >> 0) > 0);
    },

    chekBodyPrTransform: function(oBodyPr)
    {
        return isRealObject(oBodyPr) && isRealObject(oBodyPr.prstTxWarp) && oBodyPr.prstTxWarp.preset !== "textNoShape";
    },

    checkTextWarp: function(oContent, oBodyPr, dWidth, dHeight, bNeedNoTransform, bNeedWarp)
    {
        var oRet = {oTxWarpStruct: null, oTxWarpStructParamarks: null, oTxWarpStructNoTransform: null, oTxWarpStructParamarksNoTransform: null};
        //return oRet;
        var bTransform = this.chekBodyPrTransform(oBodyPr) && bNeedWarp;
		var warpGeometry = oBodyPr.prstTxWarp;
		warpGeometry && warpGeometry.Recalculate(dWidth, dHeight);
		this.recalcInfo.warpGeometry = warpGeometry;
		var bCheckWordArtContent = this.checkContentWordArt(oContent);
        var bContentRecalculated = false;
        if(bTransform || bCheckWordArtContent)
        {
            var bNeedRecalc = this.checkNeedRecalcDocContentForTxWarp(oBodyPr), dOneLineWidth, dMinPolygonLength = 0, dKoeff = 1;
            var oTheme = this.Get_Theme(), oColorMap = this.Get_ColorMap();
            var oTextDrawer = new CTextDrawer(dWidth, dHeight, true, oTheme, bNeedRecalc);
            oTextDrawer.bCheckLines = bTransform && bNeedWarp;
            var oContentToDraw = oContent;
            if(bNeedRecalc && bNeedWarp)
            {
                oContentToDraw = oContent.Copy(oContent.Parent, oContent.DrawingDocument);
                var bNeedTurnOn = false;
                if(this.bWordShape && editor && editor.WordControl.m_oLogicDocument)
                {
                    if(!editor.WordControl.m_oLogicDocument.TurnOffRecalc)
                    {
                        bNeedTurnOn = true;
                        editor.WordControl.m_oLogicDocument.TurnOff_Recalculate();
                    }
                }
                oContentToDraw.Set_ApplyToAll(true);
                oContentToDraw.Set_ParagraphSpacing({Before: 0, After: 0});
                oContentToDraw.Set_ApplyToAll(false);
                if(bNeedTurnOn)
                {
                    editor.WordControl.m_oLogicDocument.TurnOn_Recalculate(false);
                }
                dMinPolygonLength = warpGeometry.getMinPathPolygonLength();
                dOneLineWidth = GetRectContentWidth(oContentToDraw);
                if(dOneLineWidth > dMinPolygonLength)
                {
                    dKoeff = dMinPolygonLength/dOneLineWidth;
                    oContentToDraw.Reset(0, 0, dOneLineWidth, 20000);
                }
                else
                {
                    oContentToDraw.Reset(0, 0, dMinPolygonLength, 20000);
                }
                oContentToDraw.Recalculate_Page(0, true);
            }
            var dContentHeight = oContentToDraw.Get_SummaryHeight();
            var OldShowParaMarks, width_ = dWidth*dKoeff, height_ = dHeight*dKoeff;
            if(isRealObject(editor))
            {
                OldShowParaMarks = editor.ShowParaMarks;
                editor.ShowParaMarks = true;
            }
            if(bNeedWarp)
            {
                oContentToDraw.Draw(oContentToDraw.StartPage, oTextDrawer);
                oRet.oTxWarpStructParamarks = oTextDrawer.m_oDocContentStructure;
                oRet.oTxWarpStructParamarks.Recalculate(oTheme, oColorMap, width_, height_, this);
                if(bTransform)
                {
                    oRet.oTxWarpStructParamarks.checkByWarpStruct(warpGeometry, dWidth, dHeight, oTheme, oColorMap, this, dOneLineWidth, oContentToDraw.XLimit, dContentHeight, dKoeff);
                    if(bNeedNoTransform && bCheckWordArtContent)
                    {
                        if(oRet.oTxWarpStructParamarks.m_aComments.length > 0)
                        {
                            oContent.Recalculate_Page(0, true);
                            bContentRecalculated = true;
                        }
                        oContent.Draw(oContent.StartPage, oTextDrawer);
                        oRet.oTxWarpStructParamarksNoTransform = oTextDrawer.m_oDocContentStructure;
                        oRet.oTxWarpStructParamarksNoTransform.Recalculate(oTheme, oColorMap, dWidth, dHeight, this);
                        oRet.oTxWarpStructParamarksNoTransform.checkUnionPaths();
                    }
                }
                else
                {
                    oRet.oTxWarpStructParamarks.checkUnionPaths();
                    if(bNeedNoTransform && bCheckWordArtContent)
                    {
                        oRet.oTxWarpStructParamarksNoTransform = oRet.oTxWarpStructParamarks;
                    }
                }
            }
            else
            {
                if(bNeedNoTransform && bCheckWordArtContent)
                {
                    oContent.Draw(oContent.StartPage, oTextDrawer);
                    oRet.oTxWarpStructParamarksNoTransform = oTextDrawer.m_oDocContentStructure;
                    oRet.oTxWarpStructParamarksNoTransform.Recalculate(oTheme, oColorMap, dWidth, dHeight, this);
                    oRet.oTxWarpStructParamarksNoTransform.checkUnionPaths();
                }
            }

            if(isRealObject(editor))
            {
                editor.ShowParaMarks = false;
            }
            if(bNeedWarp)
            {
                oContentToDraw.Draw(oContentToDraw.StartPage, oTextDrawer);
                oRet.oTxWarpStruct = oTextDrawer.m_oDocContentStructure;
                oRet.oTxWarpStruct.Recalculate(oTheme, oColorMap, width_, height_, this);
                if(bTransform)
                {
                    oRet.oTxWarpStruct.checkByWarpStruct(warpGeometry, dWidth, dHeight, oTheme, oColorMap, this, dOneLineWidth, oContentToDraw.XLimit, dContentHeight, dKoeff);
                    if(bNeedNoTransform && bCheckWordArtContent)
                    {
                        if(oRet.oTxWarpStruct.m_aComments.length > 0 && !bContentRecalculated)
                        {
                            oContent.Recalculate_Page(0, true);
                        }
                        oContent.Draw(oContent.StartPage, oTextDrawer);
                        oRet.oTxWarpStructNoTransform = oTextDrawer.m_oDocContentStructure;
                        oRet.oTxWarpStructNoTransform.Recalculate(oTheme, oColorMap, dWidth, dHeight, this);
                        oRet.oTxWarpStructNoTransform.checkUnionPaths();
                    }
                }
                else
                {
                    oRet.oTxWarpStruct.checkUnionPaths();
                    if(bNeedNoTransform && bCheckWordArtContent)
                    {
                        oRet.oTxWarpStructNoTransform = oRet.oTxWarpStruct;
                    }
                }
            }
            else
            {
                if(bNeedNoTransform && bCheckWordArtContent)
                {
                    oContent.Draw(oContent.StartPage, oTextDrawer);
                    oRet.oTxWarpStructNoTransform = oTextDrawer.m_oDocContentStructure;
                    oRet.oTxWarpStructNoTransform.Recalculate(oTheme, oColorMap, dWidth, dHeight, this);
                    oRet.oTxWarpStructNoTransform.checkUnionPaths();
                }
            }

            if(isRealObject(editor))
            {
                editor.ShowParaMarks = OldShowParaMarks;
            }
        }
        return oRet;
    }
};

function CreateBinaryReader(szSrc, offset, srcLen)
{
    var nWritten = 0;

    var index =  -1 + offset;
    var dst_len = "";

    for( ; index < srcLen; )
    {
        index++;
        var _c = szSrc.charCodeAt(index);
        if (_c == ";".charCodeAt(0))
        {
            index++;
            break;
        }

        dst_len += String.fromCharCode(_c);
    }

    var dstLen = parseInt(dst_len);
    if(isNaN(dstLen))
        return null;
    var pointer = g_memory.Alloc(dstLen);
    var stream = new FT_Stream2(pointer.data, dstLen);
    stream.obj = pointer.obj;

    var dstPx = stream.data;

    if (window.chrome)
    {
        while (index < srcLen)
        {
            var dwCurr = 0;
            var i;
            var nBits = 0;
            for (i=0; i<4; i++)
            {
                if (index >= srcLen)
                    break;
                var nCh = DecodeBase64Char(szSrc.charCodeAt(index++));
                if (nCh == -1)
                {
                    i--;
                    continue;
                }
                dwCurr <<= 6;
                dwCurr |= nCh;
                nBits += 6;
            }

            dwCurr <<= 24-nBits;
            for (i=0; i<nBits/8; i++)
            {
                dstPx[nWritten++] = ((dwCurr & 0x00ff0000) >>> 16);
                dwCurr <<= 8;
            }
        }
    }
    else
    {
        var p = b64_decode;
        while (index < srcLen)
        {
            var dwCurr = 0;
            var i;
            var nBits = 0;
            for (i=0; i<4; i++)
            {
                if (index >= srcLen)
                    break;
                var nCh = p[szSrc.charCodeAt(index++)];
                if (nCh == undefined)
                {
                    i--;
                    continue;
                }
                dwCurr <<= 6;
                dwCurr |= nCh;
                nBits += 6;
            }

            dwCurr <<= 24-nBits;
            for (i=0; i<nBits/8; i++)
            {
                dstPx[nWritten++] = ((dwCurr & 0x00ff0000) >>> 16);
                dwCurr <<= 8;
            }
        }
    }

    return stream;
}

function getParaDrawing(oDrawing)
{
    var oCurDrawing = oDrawing;
    while(oCurDrawing.group)
    {
        oCurDrawing = oCurDrawing.group;
    }
    if(oCurDrawing.parent instanceof ParaDrawing)
    {
        return oCurDrawing.parent;
    }
    return null;
}

    function normalizeRotate(rot)
    {
        var new_rot = rot;
        if(AscFormat.isRealNumber(new_rot))
        {
            while(new_rot >= 2*Math.PI)
                new_rot -= 2*Math.PI;
            while(new_rot < 0)
                new_rot += 2*Math.PI;
            return new_rot;
        }
        return new_rot;
    }

    //--------------------------------------------------------export----------------------------------------------------
    window['AscFormat'] = window['AscFormat'] || {};
    window['AscFormat'].CheckObjectLine = CheckObjectLine;
    window['AscFormat'].CreateUniFillByUniColorCopy = CreateUniFillByUniColorCopy;
    window['AscFormat'].CreateUniFillByUniColor = CreateUniFillByUniColor;
    window['AscFormat'].ConvertParagraphToPPTX = ConvertParagraphToPPTX;
    window['AscFormat'].ConvertParagraphToWord = ConvertParagraphToWord;
    window['AscFormat'].SetXfrmFromMetrics = SetXfrmFromMetrics;
    window['AscFormat'].CShape = CShape;
    window['AscFormat'].CreateBinaryReader = CreateBinaryReader;
    window['AscFormat'].getParaDrawing = getParaDrawing;
    window['AscFormat'].normalizeRotate = normalizeRotate;
})(window);
